// Sistema de Notificações
        function showfeedview_notification(type, message = '', title = '') {
            // Mensagens padrão
            const defaultMessages = {
                success: { 
                    title: 'Sucesso!', 
                    message: 'Obrigado pelo seu interesse! Entraremos em contato em breve.' 
                },
                error: { 
                    title: 'Erro!', 
                    message: 'Ocorreu um erro ao processar sua solicitação. Tente novamente.' 
                },
                warning: { 
                    title: 'Aviso!', 
                    message: 'Por favor, verifique os campos destacados.' 
                },
                info: { 
                    title: 'Informação', 
                    message: 'Sua solicitação está sendo processada.' 
                }
            };
            
            // Usar mensagem padrão se não for fornecida
            if (!message || !title) {
                message = defaultMessages[type].message;
                title = defaultMessages[type].title;
            }
            
            // Ícones para cada tipo
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };
            
            // Criar elemento de notificação
            const feedview_notification = document.createElement('div');
            feedview_notification.className = `feedview_notification ${type}`;
            feedview_notification.innerHTML = `
                <i class="fas ${icons[type]} feedview_notification-icon"></i>
                <div class="feedview_notification-content">
                    <div class="feedview_notification-title">${title}</div>
                    <div class="feedview_notification-message">${message}</div>
                </div>
                <button class="feedview_notification-close" onclick="closefeedview_notification(this.parentElement)">
                    <i class="fas fa-times"></i>
                </button>
                <div class="feedview_notification-progress"></div>
            `;
            
            // Adicionar ao container
            document.getElementById('feedview_notificationContainer').appendChild(feedview_notification);
            
            // Mostrar notificação
            setTimeout(() => {
                feedview_notification.classList.add('show');
                
                // Iniciar barra de progresso
                const progressBar = feedview_notification.querySelector('.feedview_notification-progress');
                setTimeout(() => {
                    progressBar.style.transform = 'scaleX(0)';
                }, 50);
            }, 100);
            
            // Remover automaticamente após 5 segundos
            setTimeout(() => {
                if (feedview_notification.parentElement) {
                    closefeedview_notification(feedview_notification);
                }
            }, 5000);
        }
        
        function closefeedview_notification(feedview_notification) {
            feedview_notification.classList.remove('show');
            feedview_notification.classList.add('hide');
            
            // Remover do DOM após a animação
            setTimeout(() => {
                if (feedview_notification.parentElement) {
                    feedview_notification.parentElement.removeChild(feedview_notification);
                }
            }, 500);
        }
        
        // Sistema de feedview_modal
        function showfeedview_modal() {
            document.getElementById('feedview_modalOverlay').classList.add('show');
        }
        
        function hidefeedview_modal() {
            document.getElementById('feedview_modalOverlay').classList.remove('show');
        }
        
        // Fechar feedview_modal clicando fora dele
        document.getElementById('feedview_modalOverlay').addEventListener('click', function(e) {
            if (e.target === this) {
                hidefeedview_modal();
            }
        });
        
        // Sistema de feedview_toast
        function showfeedview_toast() {
            const feedview_toast = document.getElementById('feedview_toast');
            feedview_toast.classList.add('show');
            
            setTimeout(() => {
                feedview_toast.classList.remove('show');
            }, 3000);
        }
        
        // Demo automático de notificação de sucesso (como no seu exemplo)
        setTimeout(() => {
            showfeedview_notification('success');
        }, 1000);
