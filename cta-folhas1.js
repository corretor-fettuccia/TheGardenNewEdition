// Configuração e controle do efeito de folhas
(function() {
    // Variáveis do módulo
    const ctaFolhas1 = {
        button: null,
        canvas: null,
        leafInterval: null,
        hover: false,
        pressed: false,
        leafCount: 0,
        maxLeaves: 30,
        
        // Inicialização
        init: function() {
            this.button = document.getElementById('cta-folhas1');
            this.canvas = document.getElementById('cta-folhas1-canvas');
            
            if (!this.button || !this.canvas) return;
            
            this.setupEventListeners();
            this.startLeafAnimation();
        },
        
        // Configurar event listeners
        setupEventListeners: function() {
            this.button.addEventListener('mouseenter', () => {
                this.hover = true;
            });
            
            this.button.addEventListener('mouseleave', () => {
                this.hover = false;
            });
            
            this.button.addEventListener('mousedown', () => {
                this.pressed = true;
                this.explodeLeaves();
                setTimeout(() => { this.pressed = false; }, 500);
            });
            
            this.button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.pressed = true;
                this.explodeLeaves();
                setTimeout(() => { this.pressed = false; }, 500);
            });
            
            // Click para ação principal
            this.button.addEventListener('click', () => {
              // alert('Conectando você a propriedades exclusivas!');
            });
        },
        
        // Iniciar animação de folhas
        startLeafAnimation: function() {
            // Criar folhas continuamente
            this.leafInterval = setInterval(() => {
                if (this.leafCount < this.maxLeaves) {
                    this.createLeaf();
                }
            }, 800);
        },
        
        // Criar uma folha
        createLeaf: function() {
            const leaf = document.createElement('div');
            leaf.className = 'cta-folhas1-leaf';
            
            // Posição aleatória no botão (levando em conta o overflow)
            const posX = (Math.random() * this.button.offsetWidth);
            const posY = (Math.random() * this.button.offsetHeight);
            
            // Definir posição inicial
            leaf.style.left = `${posX}px`;
            leaf.style.top = `${posY}px`;
            
            // Tamanho aleatório
            const size = 16 + Math.random() * 16;
            leaf.style.width = `${size}px`;
            leaf.style.height = `${size}px`;
            
            // Configurar animação
            this.setupLeafAnimation(leaf);
            
            // Adicionar ao canvas
            this.canvas.appendChild(leaf);
            this.leafCount++;
            
            // Remover após a animação
            setTimeout(() => {
                if (leaf.parentNode) {
                    leaf.parentNode.removeChild(leaf);
                    this.leafCount--;
                }
            }, 3000);
        },
        
        // Configurar animação da folha
        setupLeafAnimation: function(leaf) {
            // Valores aleatórios para a animação
            const angle = (Math.random() * 80) - 40; // -40 a 40 graus
            const distance = 60 + Math.random() * 120;
            const endX = Math.cos(angle * Math.PI / 180) * distance;
            const endY = Math.sin(angle * Math.PI / 180) * distance - distance/3;
            const rotation = (Math.random() * 360) + 180;
            
            // Definir variáveis CSS
            leaf.style.setProperty('--end-x', `${endX}px`);
            leaf.style.setProperty('--end-y', `${endY}px`);
            leaf.style.setProperty('--rotation', `${rotation}deg`);
            
            // Definir animação baseada no estado
            let animationName = 'cta-folhas1-wind-normal';
            let duration = 2 + Math.random() * 1; // 2-3 segundos
            
            if (this.pressed) {
                animationName = 'cta-folhas1-explode';
                duration = 0.5 + Math.random() * 0.5; // 0.5-1 segundos
            } else if (this.hover) {
                duration = duration / 2; // Metade do tempo no hover (dobra velocidade)
            }
            
            // Aplicar a animação
            leaf.style.animation = `${animationName} ${duration}s ease-out forwards`;
            leaf.style.opacity = '0.2';
        },
        
        // Explodir folhas (quando pressionado)
        explodeLeaves: function() {
            const leaves = this.canvas.querySelectorAll('.cta-folhas1-leaf');
            
            leaves.forEach(leaf => {
                // Valores aleatórios para explosão
                const angle = Math.random() * 360;
                const distance = 100 + Math.random() * 150;
                const endX = Math.cos(angle * Math.PI / 180) * distance;
                const endY = Math.sin(angle * Math.PI / 180) * distance;
                const rotation = (Math.random() * 720) + 360;
                
                // Atualizar variáveis CSS
                leaf.style.setProperty('--end-x', `${endX}px`);
                leaf.style.setProperty('--end-y', `${endY}px`);
                leaf.style.setProperty('--rotation', `${rotation}deg`);
                
                // Aplicar animação de explosão
                leaf.style.animation = `cta-folhas1-explode ${0.5 + Math.random() * 0.5}s ease-out forwards`;
            });
            
            // Criar folhas extras para o efeito de explosão
            for (let i = 0; i < 10; i++) {
                if (this.leafCount < this.maxLeaves) {
                    this.createLeaf();
                }
            }
        }
    };
    
    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ctaFolhas1.init();
        });
    } else {
        ctaFolhas1.init();
    }
})();
