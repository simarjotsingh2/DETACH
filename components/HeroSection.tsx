'use client';

import ScrollExpandMedia from '@/components/scroll-expansion-hero';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const mediaType: 'video' | 'image' = 'video';

  return (
    <section className="relative">
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="/images/video.mp4"
        posterSrc="/images/video.mp4"
        bgImageSrc="/images/bgg.png"
        title="DΣT ΛCH"
        scrollToExpand="Scroll"
      >
        <Link href="/shop" className={styles.btnPrimary}>
          SHOP NOW <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
        <Link href="/story" className={styles.btnSecondary}>
          <Play className="mr-2 w-4 h-4" />
          WATCH STORY
        </Link>
      </ScrollExpandMedia>
    </section>
  );
}
