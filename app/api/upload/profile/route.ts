// app/api/upload/profile/route.ts
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'edgyfashion_rotkit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only key, bypasses RLS
  { auth: { persistSession: false } }
);

// --- Helpers ---------------------------------------------------------------

const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10MB
const MODEL_MAX_BYTES = 60 * 1024 * 1024; // 60MB

// Common 3D model mime types + fallback by extension
const MODEL_MIME_ALLOW = new Set([
  'model/gltf-binary',        // .glb
  'model/gltf+json',          // .gltf
  'model/obj',                // .obj (rare)
  'model/fbx',                // .fbx (rare)
  'application/octet-stream', // common for .fbx/.obj
  'application/json',         // sometimes for .gltf
]);

const MODEL_EXT_ALLOW = new Set(['glb', 'gltf', 'fbx', 'obj', 'zip']);

function getExt(name: string) {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : '';
}

type Kind = 'image' | 'model';

function inferKind(file: File): Kind | 'reject' {
  const ext = getExt(file.name);
  const mime = (file.type || '').toLowerCase();

  const looksImage = mime.startsWith('image/');
  const looksModel = MODEL_MIME_ALLOW.has(mime) || MODEL_EXT_ALLOW.has(ext);

  if (looksImage) return 'image';
  if (looksModel) return 'model';
  return 'reject';
}

function sizeLimitFor(kind: Kind) {
  return kind === 'image' ? IMAGE_MAX_BYTES : MODEL_MAX_BYTES;
}

function subfolderFor(kind: Kind) {
  return kind === 'image' ? 'images' : 'models';
}

function randomName(orig: string) {
  const ext = getExt(orig) || 'bin';
  return `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
}

// MIME fallback for Node upload
function mimeFallback(name: string, mime: string) {
  if (mime) return mime.toLowerCase();
  const ext = getExt(name);
  if (ext === 'glb') return 'model/gltf-binary';
  if (ext === 'gltf') return 'model/gltf+json';
  if (ext === 'fbx') return 'model/fbx';
  if (ext === 'obj') return 'model/obj';
  if (ext === 'zip') return 'application/zip';
  return 'application/octet-stream';
}

// --- Route -----------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // Auth
    const adminToken = req.cookies.get('admin-token')?.value;
    const userToken = req.cookies.get('user-token')?.value;
    const token = adminToken || userToken;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'CUSTOMER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const form = await req.formData();

    // context: "profile" (default) or "product"
    const url = new URL(req.url);
    const urlContext =
      url.searchParams.get('context') ||
      (form.get('context') as string) ||
      'profile';

    // Optional productId for product context
    const productId =
      url.searchParams.get('productId') ||
      (form.get('productId') as string) ||
      '';

    // Optional folder override (mainly for product context)
    const folderOverride = (form.get('folder') as string) || '';

    // Collect files
    const files: File[] = [];
    const single = form.get('file');
    if (single instanceof File) files.push(single);
    for (const [k, v] of Array.from(form.entries())) {
      if (k === 'files[]' && v instanceof File) files.push(v);
    }
    if (!files.length) {
      return NextResponse.json({ error: 'No file(s) provided' }, { status: 400 });
    }

    // Validate, infer kind per file
    type UploadPlan = {
      file: File;
      kind: Kind;
      name: string;
      basePath: string; // folder before filename
    };

    const plans: UploadPlan[] = [];

    for (const f of files) {
      const kind = inferKind(f);
      if (kind === 'reject') {
        return NextResponse.json({ error: `Unsupported file type for "${f.name}"` }, { status: 400 });
      }

      const maxBytes = sizeLimitFor(kind);
      if (f.size > maxBytes) {
        return NextResponse.json(
          {
            error:
              kind === 'image'
                ? `Image "${f.name}" exceeds ${IMAGE_MAX_BYTES / 1024 / 1024}MB`
                : `Model "${f.name}" exceeds ${MODEL_MAX_BYTES / 1024 / 1024}MB`,
          },
          { status: 400 }
        );
      }

      // Build base path
      let basePath = '';
      if (urlContext === 'product') {
        // products/{productId?}/{images|models}
        const root = folderOverride || 'products';
        const sub = subfolderFor(kind);
        basePath = productId
          ? `${root}/${productId}/${sub}`
          : `${root}/${sub}`;
      } else {
        // profile -> {admin|users}/{userId}
        const roleFolder = decoded.role === 'ADMIN' ? 'admin' : 'users';
        basePath = `${roleFolder}/${decoded.id}`;
      }

      plans.push({ file: f, kind, name: randomName(f.name), basePath });
    }

    // --- Upload all files (Node runtime needs Buffer) ----------------------
    const results: Array<{
      url: string;
      kind: Kind;
      path: string;
      name: string;
      size: number;
      mime: string;
    }> = [];

    for (const p of plans) {
      const path = `${p.basePath}/${p.name}`;

      // Convert File -> Buffer for Supabase Node client
      const ab = await p.file.arrayBuffer();
      const body = Buffer.from(ab);
      const ct = mimeFallback(p.name, p.file.type || '');

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, body, {
          cacheControl: '3600',
          upsert: false,
          contentType: ct,
        });

      if (error) {
        return NextResponse.json(
          { error: `Upload failed for "${p.file.name}": ${error.message}` },
          { status: 400 }
        );
      }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
      results.push({
        url: pub.publicUrl,
        kind: p.kind,
        path: data.path,
        name: p.file.name,
        size: p.file.size,
        mime: ct,
      });
    }

    // Profile: set first image as profileImage (ignore models)
    if (urlContext === 'profile') {
      const firstImage = results.find(r => r.kind === 'image');
      if (!firstImage) {
        return NextResponse.json({ error: 'Profile upload must include at least one image' }, { status: 400 });
      }

      if (decoded.role === 'CUSTOMER') {
        await prisma.user.update({
          where: { id: decoded.id },
          data: { profileImage: firstImage.url } as any,
        });
      } else {
        await prisma.admin.update({
          where: { id: decoded.id },
          data: { profileImage: firstImage.url } as any,
        });
      }

      return NextResponse.json({
        url: firstImage.url,
        urls: results.map(r => r.url),
        assets: results,
        pathCount: results.length,
        bucket: BUCKET,
      });
    }

    // Product: return all assets; frontend will attach to product record
    return NextResponse.json({
      assets: results, // [{url, kind: 'image'|'model', path, name, size, mime}]
      bucket: BUCKET,
      productId: productId || null,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
