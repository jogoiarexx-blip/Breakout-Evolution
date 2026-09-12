# v0.4.9 - Áudio ajustável e sprites corrigidos

- Volume geral, música e efeitos separados e persistentes.
- Áudio on/off agora funciona como mute sem perder volumes.
- Sprites passam a preservar proporção original.
- Removido desenho vetorial duplicado por baixo dos sprites novos em paddle, bola e blocos.
- Visual antigo fica apenas como fallback se um asset falhar.
- Power-ups também usam desenho proporcional.

# v0.4.9 - Visual & Audio Upgrade
- Aplicados sprites gerados para paddle, bolas, bricks, power-ups, hazards, bosses e VFX.
- Bosses e mini-bosses agora usam artes exclusivas por mundo.
- Portais, barreiras, gravidade e laser ganharam sprites dedicados.
- Áudio retrabalhado com SFX em camadas e novos sons para laser, portal, boss e explosão.
- Fallback vetorial e sonoro preservado para robustez.

# Changelog

## 0.4.9
- Nova tela CAMPANHA com cinco mundos e progresso visual.
- Ranking global por estrelas: Recruta, Piloto, Veterano, Mestre e Lendário.
- Conquistas de mundo: Conquistado, Mestre e Perfeito.
- Árvore permanente de melhorias baseada em estrelas.
- Pontos investidos não removem as estrelas exibidas da campanha.
- Cinco modificadores selecionáveis antes de iniciar cada fase.
- Modificadores afetam moedas, pontuação, velocidade, paddle, drops e laser.
- Migração automática do progresso da v0.4.5.

# v0.4.5

- Sistema de estrelas e desafios por mundo.
- Tela de recompensa ao terminar cada mundo.
- Recompensas persistentes de primeira conclusão.
- Núcleos animados exclusivos por tema para bosses/mini-bosses.
- Feedback visual de raridade na coleta de power-ups.
- Migração do progresso legado.
- Encerramento da campanha na fase 25.

### v0.4.4
- 5 desafios ambientais por mundo.
- Plataformas móveis, magma, barreiras indestrutíveis, portais e poço gravitacional.
- Novo WeaponSystem com laser do paddle.
- Novos power-ups Laser e Overcharge.
- Raridades Common/Rare/Epic/Legendary e drops ponderados.
- Sistemas separados para facilitar expansão futura.

# v0.4.4
- BossSystem funcional com introdução de batalha.
- Padrões de ataque: pulso, chuva de energia e laser.
- Blocos de núcleo se movimentam durante encontros especiais.
- Boss muda agressividade conforme perde vida.
- Recompensas permanentes salvas por boss derrotado.
- Boss principal concede +1 vida máxima na primeira vitória.
- Integração com qualidade gráfica e dificuldade.

# Changelog

## v0.4.4
- Seleção de fases com desbloqueio persistente até a fase 25.
- Cinco mundos: Neon District, Fornalha, Crystal Caves, Void Grid e Golden Core.
- Fundo e música agora são associados ao mundo (blocos de 5 fases), não alternados a cada fase.
- Distribuição temática de tijolos por mundo.
- Mini-boss nas fases 5, 15 e 25; bosses nas fases 10 e 20.
- Barra de vida para mini-boss/boss.
- Loading identifica mundo e encontro especial.
- Atmosfera visual por mundo respeitando LOW/MEDIUM/HIGH.
- Velocidade recebe multiplicador progressivo por mundo sem remover a dificuldade selecionável.
- Progressão salva em localStorage.

## v0.4.9 - Renderização adaptativa e aceleração
- Novo RenderManager com Canvas 2D de baixa latência (`desynchronized`) e superfície opaca.
- Detecção de GPU/WebGL para diagnóstico e preferência de alto desempenho quando disponível.
- Render scale real por qualidade: Baixo 72%, Médio 90%, Alto 100% (GPU Preferida pode usar 108% no Alto).
- Física e coordenadas continuam em 800x600 lógicos, sem alterar gameplay.
- Modo Automático agora também ajusta a resolução interna ao mudar de qualidade por FPS.
- Nova opção Aceleração: Auto / GPU Preferida / Compatível.
- Menu de configurações mostra status da renderização e GPU detectada.
- Correção do mouse/touch para funcionar com qualquer render scale.
- CSS com hints de compositor (`translateZ(0)`, `will-change`, `contain`) e redução de movimento.
