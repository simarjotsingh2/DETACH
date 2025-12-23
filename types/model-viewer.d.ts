// types/model-viewer.d.ts
declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            // common attributes (make them all optional + loose)
            src?: string;
            poster?: string;
            'camera-controls'?: boolean | string;
            'auto-rotate'?: boolean | string;
            autoplay?: boolean | string;
            ar?: boolean | string;
            'ar-modes'?: string;
            exposure?: string | number;
            'shadow-intensity'?: string | number;
            'shadow-softness'?: string | number;
            style?: React.CSSProperties;
            class?: string;        // web component accepts `class`
            className?: string;    // React style also OK
            // …add others as needed
        };
    }
}
