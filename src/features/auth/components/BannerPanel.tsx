interface BannerPanelProps {
  audience: string;
  slogans: string[];
  imageSrc: string;
  imageAlt: string;
  side: 'left' | 'right';
}

export function BannerPanel({ audience, slogans, imageSrc, imageAlt, side }: BannerPanelProps) {
  return (
    <div className={`animated-auth__panel animated-auth__panel--${side}`}>
      <div className="animated-auth__panel-content">
        <div className="animated-auth__banner-copy">
          {audience && <span className="animated-auth__banner-eyebrow">{audience}</span>}
          <h3>Motor dünyasına hoş geldiniz</h3>
          <div className="animated-auth__slogan-list">
            {slogans.map((slogan, index) => (
              <div className="animated-auth__slogan-item" key={slogan}>
                <span className="animated-auth__slogan-index">{index + 1}</span>
                <span className="animated-auth__slogan-text">
                  <strong>{slogan}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <img src={imageSrc} className="animated-auth__image" alt={imageAlt} />
    </div>
  );
}
