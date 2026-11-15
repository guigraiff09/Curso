const formCadastro = document.getElementById('formCadastro');

// Verificar se o formulário existe
if (formCadastro) {

    const botaoCadastro = formCadastro.querySelector('.botao-cad');

    // ========================================
    // FUNÇÃO PARA ALTERAR OS BOTÕES
    // ========================================

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
        }
    }

    // ========================================
    // CADASTRO DE USUÁRIO
    // ========================================

    formCadastro.addEventListener('submit', async (event) => {

        event.preventDefault();

        // Impedir vários envios ao mesmo tempo
        if (botaoCadastro.disabled) {
            return;
        }

        // ========================================
        // CAPTURAR DADOS DO FORMULÁRIO
        // ========================================

        const nome_completo = document.getElementById('nameUsuario').value.trim();

        const email = document.getElementById('email').value.trim();

        const senha = document.getElementById('password').value;

        const confirmarSenha = document.getElementById('confirm-senha').value;

        const data_nascimento = document.getElementById('date').value;

        const telefone = document.getElementById('tel').value.trim();

        const aceitou_termos = document.getElementById('checkbox').checked;

        // ========================================
        // VALIDAR CAMPOS
        // ========================================

        if (
            !nome_completo ||
            !email ||
            !senha ||
            !confirmarSenha ||
            !data_nascimento
        ) {
            Swal.fire({
                title: 'Campos obrigatórios',
                text: 'Preencha todos os campos necessários.',
                icon: 'warning',
                confirmButtonText: 'Entendi'
            });

            return;
        }

        if (senha.length < 8) {
            Swal.fire({
                title: 'Senha inválida',
                text: 'A senha precisa ter pelo menos 8 caracteres.',
                icon: 'warning',
                confirmButtonText: 'Entendi'
            });

            return;
        }

        if (senha !== confirmarSenha) {
            Swal.fire({
                title: 'Senhas diferentes',
                text: 'As senhas digitadas não são iguais.',
                icon: 'error',
                confirmButtonText: 'Tentar novamente'
            });

            return;
        }

        if (!aceitou_termos) {
            Swal.fire({
                title: 'Atenção!',
                text: 'Você precisa aceitar os termos e as políticas de privacidade.',
                icon: 'warning',
                confirmButtonText: 'Entendi'
            });

            return;
        }

        // ========================================
        // OBJETO COM OS DADOS DO CADASTRO
        // ========================================

        const dadosCadastro = {
            nome_completo,
            email,
            senha,
            data_nascimento,
            telefone,
            aceitou_termos
        };

        try {

            // Bloquear botão durante o cadastro
            botaoCadastro.disabled = true;
            botaoCadastro.textContent = 'Cadastrando...';

            // ========================================
            // ENVIAR DADOS PARA O BACK-END
            // ========================================

            const resposta = await fetch('http://localhost:3000/usuarios', {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(dadosCadastro)
            });

            const resultado = await resposta.json();

            console.log('Resposta do cadastro:', resultado);
            console.log('Data de cadastro:', resultado.usuario?.criado_em);

            // ========================================
            // VERIFICAR SE O EMAIL JÁ EXISTE
            // ========================================

            if (resposta.status === 409) {

                await Swal.fire({
                    title: 'Email já cadastrado!',
                    text: 'Utilize outro endereço de email.',
                    icon: 'warning',
                    confirmButtonText: 'Entendi'
                });

                return;
            }

            // ========================================
            // VERIFICAR ERROS DO CADASTRO
            // ========================================

            if (!resposta.ok) {

                await Swal.fire({
                    title: 'Erro no cadastro',
                    text: resultado.message || 'Não foi possível realizar o cadastro.',
                    icon: 'error',
                    confirmButtonText: 'Tentar novamente'
                });

                return;
            }

            // ========================================
            // RECEBER DADOS DO USUÁRIO
            // ========================================

            const usuario = resultado.usuario;

            if (!usuario || !usuario.id) {
                throw new Error('O servidor não retornou os dados do usuário.');
            }

            // ========================================
            // SALVAR USUÁRIO NO SESSION STORAGE
            // ========================================

            sessionStorage.setItem(
                'usuario',
                JSON.stringify({
                    id: usuario.id,
                    nome_completo: usuario.nome_completo,
                    email: usuario.email,
                    criado_em: usuario.criado_em,
                    data_nascimento: usuario.data_nascimento,
                    telefone: usuario.telefone,
                    aceitou_termos: usuario.aceitou_termos
                })
            );

            // ========================================
            // ALERTA DE BOAS-VINDAS
            // ========================================

            await Swal.fire({
                title: `Olá, seja bem-vindo, ${usuario.nome_completo}!`,
                text: 'Cadastro realizado com sucesso!',
                icon: 'success',
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#3085d6'
            });

            // ========================================
            // REDIRECIONAR PARA A PÁGINA INICIAL
            // ========================================

            window.location.href = '/index.html';

        } catch (erro) {

            console.error('Erro ao cadastrar:', erro);

            Swal.fire({
                title: 'Erro de conexão',
                text: 'Não foi possível conectar ao servidor. Verifique se o Back-end está funcionando.',
                icon: 'error',
                confirmButtonText: 'Entendi'
            });

        } finally {

            // Desbloquear botão
            botaoCadastro.disabled = false;
            botaoCadastro.textContent = 'Cadastrar';

        }
    });

    // ========================================
    // VERIFICAR USUÁRIO AO CARREGAR A PÁGINA
    // ========================================

    verificarLogin();
}