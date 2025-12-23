'use client';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactNode, useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.1, // smoothness
            easing: (t: number) => 1 - Math.pow(1 - t, 3),
            smoothWheel: true,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Tie Lenis to ScrollTrigger so scrubbed animations stay in sync
        lenis.on('scroll', ScrollTrigger.update);
        ScrollTrigger.scrollerProxy(document.body, {
            scrollTop(value) {
                if (value !== undefined) lenis.scrollTo(value, { immediate: true });
                // @ts-ignore
                return lenis.scroll;
            },
            getBoundingClientRect() {
                return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            }
        });

        // Accessibility: respect “reduce motion”
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mq.matches) {
            lenis.destroy();
        }

        return () => {
            lenis.destroy();
            ScrollTrigger.killAll();
        };
    }, []);

    return <>{children}</>;
}
