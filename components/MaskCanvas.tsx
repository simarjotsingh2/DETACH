'use client'

import {
    Bounds,
    Center,
    Environment,
    Html,
    OrbitControls,
    useBounds,
    useGLTF
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'

function FitOnReady() {
    const api = useBounds()
    // When scene mounts, fit once.
    useMemo(() => {
        // Slight delay so children exist
        setTimeout(() => api.fit(), 0)
    }, [api])
    return null
}

function MaskGLB() {
    // 👉 Make sure the path matches your public folder:
    // If file lives at public/models/mask.glb use '/models/mask.glb'
    // If at public/images/models/mask.glb use '/images/models/mask.glb'
    const { scene } = useGLTF('/images/models/mask.glb') as any

    // Normalize materials & shadows
    scene.traverse((o: any) => {
        if (o.isMesh) {
            o.castShadow = true
            o.receiveShadow = false
            const m = o.material
            if (m?.map) m.map.colorSpace = THREE.SRGBColorSpace
            if ('envMapIntensity' in m) m.envMapIntensity = 0.8
        }
    })

    /** Wrap with <Center> so the mask is centered at origin with a sane scale */
    return (
        <Center disableY top>
            {/* top=true keeps it sitting "on the ground" */}
            <primitive object={scene} />
        </Center>
    )
}

export default function MaskCanvas() {
    return (
        <Canvas
            // PERF: lower DPR on mobile/hi-DPI, request high-perf GPU path
            dpr={[1, 1.5]}
            gl={{ powerPreference: 'high-performance', antialias: true }}
            // For a static hero consider 'demand' + invalidate on control changes
            frameloop="demand"
            camera={{ fov: 45, position: [0, 1.2, 3], near: 0.1, far: 50 }}
            style={{ width: '100%', height: '60vh', background: '#0b0f14' }}
            shadows={false}   // turn off expensive real-time shadows for now
        >
            {/* simple, cheap lighting */}
            <hemisphereLight args={[0xffffff, 0x1a1a1a, 0.8]} />
            <directionalLight position={[2, 4, 3]} intensity={1.0} />

            <Suspense
                fallback={
                    <Html center style={{ color: '#fff', fontFamily: 'system-ui' }}>
                        Loading mask…
                    </Html>
                }
            >
                {/* Bounds will compute a bounding-sphere and fit the camera */}
                <Bounds fit clip observe margin={1.2}>
                    <MaskGLB />
                    <FitOnReady />
                </Bounds>

                {/* HDRI gives nice reflections without heavy lights */}
                <Environment preset="studio" />
            </Suspense>

            {/* In 'frameloop="demand"', re-render only while user drags/zooms */}
            <OrbitControls
                enableDamping
                makeDefault
                onChange={(e) => {
                    // invalidate the frame when camera changes
                    // @ts-ignore
                    e?.target?.object?.layers && (window as any).requestAnimationFrame?.(() => { })
                }}
            />
        </Canvas>
    )
}

// Optional: Preload; keep the same URL you used in useGLTF above
useGLTF.preload('/images/models/mask.glb')
