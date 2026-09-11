# Breakout Evolution v0.4.3

Evolução modular do Breakout.

## Novidades da 0.4.3
- 5 mundos temáticos com identidade e distribuição de blocos próprias.
- Tela de seleção de fases com desbloqueio persistente.
- Mini-boss a cada 5 fases e boss maior a cada 10.
- Barra de vida para encontros especiais.
- Progressão salva em localStorage.
- Mantidos gráficos AUTO/LOW/MEDIUM/HIGH, dificuldade e loading por fase da 0.4.1.
- Estrutura modular preservada.

## Controles
Setas/WASD: navegar/mover. Enter/Espaço: confirmar/lançar. P: pausa. Esc: voltar.

## Novidades v0.4.3
- Sistema de bosses modular em `js/systems/boss-system.js`.
- Introdução especial antes de mini-bosses e bosses.
- Ataques por pulso, chuva de energia e laser.
- Núcleos de boss se movem durante a luta.
- Três fases de agressividade conforme a vida do boss cai.
- Recompensas persistentes por primeira vitória.
- Boss principal concede +1 vida máxima permanente (limite 8).
- Ataques respeitam pausa, loading e estado do jogo.
