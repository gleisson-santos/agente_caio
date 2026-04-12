import { useState, useEffect } from 'react'

export default function DomainSetupBanner() {
    const [isIP, setIsIP] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        const hostname = window.location.hostname
        // Check if hostname is an IP (v4)
        const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
        if (ipPattern.test(hostname)) {
            setIsIP(true)
        }
    }, [])

    if (!isIP || dismissed) return null

    return (
        <div className="domain-banner fade-in">
            <div className="domain-banner-content">
                <span className="domain-icon">🌐</span>
                <div className="domain-text">
                    <strong>Acesso via IP Detectado:</strong> Configure um domínio (ex: caio.seudominio.com) no <code>docker-compose.yml</code> para habilitar SSL (HTTPS) e segurança total da Stack.
                </div>
                <button className="domain-close" onClick={() => setDismissed(true)}>✕</button>
            </div>
        </div>
    )
}
