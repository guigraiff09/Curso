const formLogin = document.getElementById('formLogin');
const mensagemLogin = document.getElementById('mensagemLogin');

// ========================================
// VERIFICAR SE O USUÁRIO ESTÁ LOGADO
// ========================================

function obterUsuarioLogado() {
    const usuario = sessionStorage.getItem('usuario');

    if (!usuario) {
        return null;
    }

    try {
        return JSON.parse(usuario);
    } catch (error) {
        console.error('Erro ao recuperar usuário:', error);
        sessionStorage.removeItem('usuario');
        return null;
    }
}

// ========================================
// ALTERAR BOTÕES DO MENU
// ========================================

function verificarLogin() {
    const usuarioLogado = obterUsuarioLogado();

    const perfil = document.getElementById('imgPerfil');
    const entrar = document.querySelector('.Entrar');

    if (usuarioLogado) {
        if (entrar) {
            entrar.style.display = 'none';
        }

        if (perfil) {
            perfil.style.display = 'block';
        }
    } else {
        if (entrar) {
            entrar.style.display = 'block';
        }

        if (perfil) {
            perfil.style.display = 'none';
        }
    }
}

// ========================================
// CARREGAR DADOS DO PERFIL
// ========================================

function carregarDadosPerfil() {
    const usuario = obterUsuarioLogado();

    if (!usuario) {
        return;
    }

    const nameUsuario = document.getElementById('nameUsuario');
    const nomeSimples = document.getElementById('nome-simples');
    const emailUsuario = document.querySelectorAll('.emailusuario');
    const anoCad = document.querySelectorAll('[data-email-perfil]');

    if (nameUsuario) {
        nameUsuario.textContent = usuario.nome_completo || 'Usuário';
    }

    if (nomeSimples) {
        nomeSimples.textContent =
            usuario.nome_completo?.split(' ')[0] || 'Usuário';
    }

    if (emailUsuario) {
            emailUsuario.forEach(elemento => {
        elemento.textContent = usuario.email || 'Email não disponível';
    });

    }


if (anoCad.length > 0) {
    if (usuario.criado_em) {
        const dataCadastro = new Date(usuario.criado_em);

        anoCad.forEach(elemento => {
            elemento.textContent = Number.isNaN(dataCadastro.getTime())
                ? 'Data não disponível'
                : dataCadastro.toLocaleDateString('pt-BR');
        });

    } else {
        anoCad.forEach(elemento => {
            elemento.textContent = 'Data não disponível';
        });
    }
}
}

// ========================================
// REALIZAR LOGIN
// ========================================

if (formLogin) {
    formLogin.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('password').value;

        mensagemLogin.textContent = 'Verificando seus dados...';

        try {
            const resposta = await fetch('http://localhost:3000/login', {
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

            console.log('Usuário recebido:', dados.usuario);
            console.log('Data de cadastro:', dados.usuario?.criado_em);

            if (!resposta.ok) {
                mensagemLogin.textContent =
                    dados.message || 'Email ou senha incorretos.';

                return;
            }

            // SALVAR TODOS OS DADOS DO USUÁRIO
            sessionStorage.setItem(
                'usuario',
                JSON.stringify(dados.usuario)
            );

            mensagemLogin.textContent = 'Login realizado com sucesso!';

            // REDIRECIONAR PARA A PÁGINA INICIAL
            window.location.href = '/index.html';

        } catch (error) {
            console.error('Erro ao realizar login:', error);

            mensagemLogin.textContent =
                'Não foi possível conectar ao servidor.';
        }
    });
}

// ========================================
// EXECUTAR AO ABRIR A PÁGINA
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    carregarDadosPerfil();
});