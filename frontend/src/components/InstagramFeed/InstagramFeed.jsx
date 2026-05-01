import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import styles from './instagramFeed.module.scss'

function InstagramFeed({ postShortcodes = [], handle = '', profileUrl = '' }) {
    const containerRef = useRef(null)

    useEffect(() => {
        // Load Instagram embed script once
        if (!document.getElementById('instagram-embed-script')) {
            const script = document.createElement('script')
            script.id = 'instagram-embed-script'
            script.src = 'https://www.instagram.com/embed.js'
            script.async = true
            document.body.appendChild(script)
        } else if (window.instgrm) {
            window.instgrm.Embeds.process()
        }
    }, [postShortcodes])

    if (!postShortcodes.length && !profileUrl) return null

    return (
        <div className={styles.instagramFeed} ref={containerRef}>
            <div className={styles.instagramFeed__header}>
                <FontAwesomeIcon icon={faInstagram} className={styles.instagramFeed__icon} />
                <div>
                    <h4 className={styles.instagramFeed__title}>Instagram Feed</h4>
                    {handle ? (
                        <a
                            href={profileUrl || `https://www.instagram.com/${handle.replace('@', '')}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.instagramFeed__handle}
                        >
                            {handle}
                        </a>
                    ) : null}
                </div>
            </div>

            <div className={styles.instagramFeed__grid}>
                {postShortcodes.map((shortcode) => (
                    <div key={shortcode} className={styles.instagramFeed__embedWrapper}>
                        <iframe
                            src={`https://www.instagram.com/p/${shortcode}/embed/`}
                            className={styles.instagramFeed__iframe}
                            frameBorder="0"
                            scrolling="no"
                            allowTransparency="true"
                            title={`Instagram post ${shortcode}`}
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>

            {profileUrl ? (
                <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.instagramFeed__viewAll}
                >
                    View all posts on Instagram →
                </a>
            ) : null}
        </div>
    )
}

export default InstagramFeed
