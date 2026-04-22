(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const container = document.createElement('div');
        container.className = 'brand_container';
        
        const pacote = document.createElement('div');
        pacote.className = 'brand_pacote';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'brand_image_wrapper';
        
        const img = document.createElement('img');
        img.className = 'brand_image';
        img.src = './brand/brand.webp';
        
        const divLetreiro = document.createElement('div');
        divLetreiro.className = 'brand_div_letreiro';
        
        const texto = document.createElement('div');
        texto.className = 'brand_texto';
        
        const cursor = document.createElement('span');
        cursor.className = 'brand_cursor';
        cursor.textContent = '|';
        
        texto.appendChild(cursor);
        divLetreiro.appendChild(texto);
        wrapper.appendChild(img);
        wrapper.appendChild(divLetreiro);
        pacote.appendChild(wrapper);
        container.appendChild(pacote);
        document.body.appendChild(container);
        
        let mensagens = [];
        let idx = 0;
        let letraIdx = 0;
        let timer = null;
        let aguardando = false;
        
        fetch('./brand/brand.xml')
            .then(res => res.text())
            .then(xml => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(xml, 'text/xml');
                const nodes = doc.querySelectorAll('message, pause');
                
                mensagens = Array.from(nodes).map(node => {
                    if (node.tagName === 'message') {
                        return {
                            tipo: 'message',
                            texto: node.textContent,
                            tempo: parseInt(node.getAttribute('time')) || 3000
                        };
                    } else if (node.tagName === 'pause') {
                        return {
                            tipo: 'pause',
                            tempo: parseInt(node.getAttribute('time')) || 1000
                        };
                    }
                    return null;
                }).filter(m => m !== null);
                
                iniciar();
            })
            .catch(() => {
                mensagens = [
                    { tipo: 'message', texto: 'Bem-vindo!', tempo: 3000 },
                    { tipo: 'message', texto: 'Oferta especial!', tempo: 3500 },
                    { tipo: 'message', texto: 'Frete grátis!', tempo: 3000 }
                ];
                iniciar();
            });
        
        function deslizarEntrada() {
            return new Promise((resolve) => {
                pacote.classList.remove('brand_deslizaSaida');
                pacote.classList.add('brand_deslizaEntrada');
                setTimeout(() => {
                    resolve();
                }, 500);
            });
        }
        
        function deslizarSaida() {
            return new Promise((resolve) => {
                pacote.classList.remove('brand_deslizaEntrada');
                pacote.classList.add('brand_deslizaSaida');
                setTimeout(() => {
                    resolve();
                }, 500);
            });
        }
        
        function iniciar() {
            setTimeout(async () => {
                container.classList.add('brand_active');
                await deslizarEntrada();
                processarFila();
            }, 100);
        }
        
        async function processarFila() {
            if (aguardando) return;
            if (idx >= mensagens.length) {
                return;
            }
            
            const item = mensagens[idx];
            
            if (item.tipo === 'pause') {
                aguardando = true;
                
                // DESLIZA SAÍDA
                await deslizarSaida();
                
                // AGUARDA O TEMPO DA PAUSA
                await new Promise(resolve => setTimeout(resolve, item.tempo));
                
                idx++;
                
                // DESLIZA ENTRADA
                await deslizarEntrada();
                
                aguardando = false;
                processarFila();
                
            } else if (item.tipo === 'message') {
                letraIdx = 0;
                escreverMensagem(item);
            }
        }
        
        function escreverMensagem(msg) {
            if (letraIdx < msg.texto.length) {
                const exibido = msg.texto.substring(0, letraIdx + 1);
                texto.innerHTML = exibido + '<span class="brand_cursor">|</span>';
                letraIdx++;
                timer = setTimeout(() => escreverMensagem(msg), 100); //ajusta o time da escrita.
            } else {
                texto.innerHTML = msg.texto + '<span class="brand_cursor">|</span>';
                timer = setTimeout(() => {
                    idx++;
                    processarFila();
                }, msg.tempo);
            }
        }
    });
})();
