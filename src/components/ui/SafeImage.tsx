'use client';
import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { Icon } from './Icon';

/** next/image com plano B: se a foto não carregar, mostra o ícone padrão em vez de imagem quebrada. */
export function SafeImage(props: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-ink-3 text-mute" role="img" aria-label={typeof props.alt === 'string' ? props.alt : ''}>
        <Icon name="stage" size={36} />
      </span>
    );
  }
  // eslint-disable-next-line jsx-a11y/alt-text -- alt vem nas props
  return <Image {...props} onError={() => setFailed(true)} />;
}
