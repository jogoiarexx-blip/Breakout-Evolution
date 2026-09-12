# v0.4.7 - Visual & Audio Upgrade
- Aplicados sprites gerados para paddle, bolas, bricks, power-ups, hazards, bosses e VFX.
- Bosses e mini-bosses agora usam artes exclusivas por mundo.
- Portais, barreiras, gravidade e laser ganharam sprites dedicados.
- Áudio retrabalhado com SFX em camadas e novos sons para laser, portal, boss e explosão.
- Fallback vetorial e sonoro preservado para robustez.

# Changelog

## 0.4.7
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
