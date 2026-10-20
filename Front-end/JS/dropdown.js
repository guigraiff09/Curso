
        // Função para o menu hambúrguer do topo
        function toggleMenu() {
            const menu = document.getElementById('menuSu');
            menu.classList.toggle('active');
        }

        // Função para abrir/fechar o dropdown de sintomas
        function Submenu() {
            const menuList = document.querySelector('.dropdown-menu');
            const seta = document.getElementById('menu-Seta');

            menuList.classList.toggle('active');
            seta.classList.toggle('rotate');
        }

        // Evento para fechar o menu ao clicar fora
        document.addEventListener('click', function(event) {
            const menuList = document.querySelector('.dropdown-menu');
            const btnSintoma = document.querySelector('.escolha-sintoma'); // Pegamos a caixa toda do botão/dropdown

            // Verifica se o clique foi fora da caixa do dropdown E fora do botão
            if (!menuList.contains(event.target) && !btnSintoma.contains(event.target)) {
                menuList.classList.remove('active'); // Corrigido de .remote para .remove
                
                const seta = document.getElementById('menu-Seta');
                if (seta) {
                    seta.classList.remove('rotate'); // Tira o giro da seta também
                }
            }
        });
 