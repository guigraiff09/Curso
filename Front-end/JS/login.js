const formLogin = document.getElementById('formLogin');
const mensagemLogin = document.getElementById('mensagemLogin');

// FUNÇÃO PARA ALTERAR OS BOTÕES
function verificarLogin() {

    const usuarioLogado = sessionStorage.getItem('usuario');

    const perfil = document.querySelector('.perfil');
    const entrarUsu = document.querySelector('.Entrar');

    if (usuarioLogado) {

        if (entrarUsu) {
            entrarUsu.style.display = 'none';
        }

        if (perfil) {
            perfil.style.display = 'block';
        }

    } else {

        if (entrarUsu) {
            entrarUsu.style.display = 'block';
        }

        if (perfil) {
            perfil.style.display = 'none';
        }
        if(usuarioLogado) {
            alert('olá, seja bem-vindo ' + sessionStorage.getItem('usuario'));
        }
    }
}

// LOGIN
if (formLogin) {

    formLogin.addEventListener('submit', async (event) => {

        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('password').value;

        mensagemLogin.textContent = 'Verificando seus dados...';

        try {

            const resposta = await fetch('https://cur-delta.vercel.app',{

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    email,
                    senha
                })

            });

            const dados = await resposta.json();

            if (!resposta.ok) {

                mensagemLogin.textContent = dados.message;
                return;

            }

            sessionStorage.setItem(
                'usuario',
                JSON.stringify(dados.usuario)
            );

            mensagemLogin.textContent = 'Login realizado com sucesso!';

            window.location.href = '/index.html';

        } catch (erro) {

            console.error('Erro no login:', erro);

            mensagemLogin.textContent =
                'Erro ao conectar com o servidor.';

        }

    });

}

// VERIFICAR USUÁRIO AO CARREGAR A PÁGINA
verificarLogin();