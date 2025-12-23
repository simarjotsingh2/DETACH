'use client'
import { forwardRef } from 'react'

interface ProductModelViewerProps {
    src: string
    className?: string
    poster?: string
}

const ProductModelViewer = forwardRef<any, ProductModelViewerProps>(
    ({ src, className, poster }, ref) => {
        // @ts-ignore custom element
        return (
            <model-viewer
                src={src}
                poster={poster}
                camera-controls
                auto-rotate
                autoplay
                interaction-prompt="none"
                tone-mapping="neutral"
                environment-image="neutral"
                exposure="1.15"
                /* 👇 start straight-on and keep pitch near level */
                camera-orbit="0deg 90deg auto"
                min-camera-orbit="auto 100deg auto"
                max-camera-orbit="auto 100deg auto"
                style={{ width: '100%', height: '520px', borderRadius: 12, background: 'transparent' }}
                className={className}
            />
        )
    }
)

ProductModelViewer.displayName = 'ProductModelViewer'
export default ProductModelViewer
