# Assets — Breakout Evolution v0.4.6

- `images/backgrounds/`: 5 temas de fase + fundo do menu em WebP.
- `images/paddle/`: sprite do paddle.
- `images/ball/`: bola normal e fireball.
- `images/bricks/`: texturas WebP dos principais tipos de bloco.
- `images/powerups/`: ícones WebP dos power-ups principais.
- `audio/sfx/`: efeitos WAV curtos carregados pelo AudioManager.
- `audio/music/`: 5 loops leves, alternados por tema de fase.

O `AssetManager` carrega os assets compartilhados no boot e apenas o tema necessário na troca de fase.
