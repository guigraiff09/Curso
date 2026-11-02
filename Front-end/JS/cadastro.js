const formCadastro = document.getElementById('formCadastro');
const botaoCadastro = formCadastro.querySelector('.botao-cad');

formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Impedir vários envios ao mesmo tempo
    if (botaoCadastro.disabled) {
        return;
    }

    const nome_completo = document.getElementById('nameUsuario').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value;
    const confirmarSenha = document.getElementById('confirm-senha').value;
    const data_nascimento = document.getElementById('date').value;
    const telefone = document.getElementById('tel').value.trim();
    const aceitou_termos = document.getElementById('checkbox').checked;

    if (senha !== confirmarSenha) {
        alert('As senhas não são iguais!');
        return;
    }

    if (!aceitou_termos) {
        alert('Você precisa aceitar os termos e as políticas de privacidade.');
        return;
    }

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

        const resposta = await fetch('http://localhost:3000/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosCadastro)
        });

        const resultado = await resposta.json();

        if (resposta.status === 409) {
            alert('Este e-mail já está cadastrado. Utilize outro e-mail.');
            return;
        }

        if (!resposta.ok) {
            alert(resultado.message || 'Não foi possível realizar o cadastro.');
            return;
        }

        alert('Cadastro realizado com sucesso!');

        formCadastro.reset();

    } catch (erro) {
        console.error('Erro ao cadastrar:', erro);

        alert('Não foi possível conectar ao servidor. Verifique se o Back-end está funcionando.');

    } finally {
        // Liberar o botão novamente
        botaoCadastro.disabled = false;
        botaoCadastro.textContent = 'Cadastrar';
    }
});
