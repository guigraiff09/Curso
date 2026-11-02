// server.mjs

import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import cors from "cors";
import { timingSafeEqual } from "node:crypto";

const prisma = new PrismaClient();
const app = express();

const PORTA = Number(process.env.PORT || 3000);

// CORS: endereço do frontend na Vercel
const origensPermitidas = [
  process.env.FRONTEND_URL,
  "http://127.0.0.1:5500",
  "http://localhost:5500"
].filter(Boolean);

app.use(cors({
  origin(origem, callback) {
    if (!origem || origensPermitidas.includes(origem)) {
      return callback(null, true);
    }

    return callback(new Error("Origem não permitida pelo CORS."));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-admin-key"]
}));

app.use(express.json({ limit: "10kb" }));

// ========================================
// ROTA DE TESTE
// ========================================

app.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    aplicacao: "Mecânica na Prática"
  });
});

// ========================================
// PROTEÇÃO DAS ROTAS ADMINISTRATIVAS
// ========================================

function exigirChaveAdmin(req, res, next) {
  const chaveConfigurada = process.env.ADMIN_API_KEY;
  const chaveRecebida = req.get("x-admin-key");

  if (!chaveConfigurada) {
    return res.status(503).json({
      message: "Acesso administrativo não configurado."
    });
  }

  if (
    typeof chaveRecebida !== "string" ||
    chaveRecebida.length !== chaveConfigurada.length ||
    !timingSafeEqual(
      Buffer.from(chaveRecebida),
      Buffer.from(chaveConfigurada)
    )
  ) {
    return res.status(401).json({
      message: "Acesso não autorizado."
    });
  }

  return next();
}

// ========================================
// ROTA GET - LISTAR USUÁRIOS
// ========================================

app.get("/usuarios", exigirChaveAdmin, async (_req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        nome_completo: true,
        email: true,
        data_nascimento: true,
        criado_em: true,
        telefone: true,
        aceitou_termos: true
      }
    });

    return res.status(200).json(usuarios);

  } catch (error) {
    console.error("ERRO NO GET /usuarios:", error);

    return res.status(500).json({
      message: "Erro ao buscar usuários."
    });
  }
});

// ========================================
// ROTA POST - CADASTRAR USUÁRIO
// ========================================

app.post("/usuarios", async (req, res) => {
  try {
    const {
      nome_completo,
      email,
      senha,
      data_nascimento,
      telefone,
      aceitou_termos
    } = req.body ?? {};

    if (
      typeof nome_completo !== "string" ||
      !nome_completo.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof senha !== "string" ||
      senha.length < 8 ||
      typeof data_nascimento !== "string" ||
      !data_nascimento ||
      typeof aceitou_termos !== "boolean"
    ) {
      return res.status(400).json({
        message: "Informe nome, email, senha com mínimo de 8 caracteres, data de nascimento e aceite dos termos."
      });
    }

    const dataNascimento = new Date(
      `${data_nascimento}T00:00:00.000Z`
    );

    if (Number.isNaN(dataNascimento.getTime())) {
      return res.status(400).json({
        message: "Data de nascimento inválida."
      });
    }

    // Criptografar a senha
    const senhaHash = await bcrypt.hash(senha, 12);

    const usuario = await prisma.usuarios.create({
      data: {
        nome_completo: nome_completo.trim(),
        email: email.trim().toLowerCase(),
        senha: senhaHash,
        data_nascimento: dataNascimento,
        telefone:
          typeof telefone === "string" && telefone.trim()
            ? telefone.trim()
            : null,
        aceitou_termos
      },

      select: {
        id: true,
        nome_completo: true,
        email: true,
        data_nascimento: true,
        telefone: true,
        aceitou_termos: true
      }
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      usuario
    });

  } catch (error) {
    console.error("ERRO NO POST /usuarios:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Este email já está cadastrado."
      });
    }

    return res.status(500).json({
      message: "Erro ao cadastrar usuário."
    });
  }
});

// ========================================
// ROTA PUT - ATUALIZAR USUÁRIO
// ========================================

app.put("/usuarios/:id", exigirChaveAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID inválido."
      });
    }

    const {
      nome_completo,
      email,
      senha,
      data_nascimento,
      telefone,
      aceitou_termos
    } = req.body ?? {};

    const dados = {};

    if (nome_completo !== undefined) {
      if (
        typeof nome_completo !== "string" ||
        !nome_completo.trim()
      ) {
        return res.status(400).json({
          message: "Nome inválido."
        });
      }

      dados.nome_completo = nome_completo.trim();
    }

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !email.trim()
      ) {
        return res.status(400).json({
          message: "Email inválido."
        });
      }

      dados.email = email.trim().toLowerCase();
    }

    if (senha !== undefined) {
      if (
        typeof senha !== "string" ||
        senha.length < 8
      ) {
        return res.status(400).json({
          message: "A senha deve ter pelo menos 8 caracteres."
        });
      }

      dados.senha = await bcrypt.hash(senha, 12);
    }

    if (data_nascimento !== undefined) {
      if (
        typeof data_nascimento !== "string" ||
        !data_nascimento
      ) {
        return res.status(400).json({
          message: "Data de nascimento inválida."
        });
      }

      const data = new Date(
        `${data_nascimento}T00:00:00.000Z`
      );

      if (Number.isNaN(data.getTime())) {
        return res.status(400).json({
          message: "Data de nascimento inválida."
        });
      }

      dados.data_nascimento = data;
    }

    if (telefone !== undefined) {
      dados.telefone =
        typeof telefone === "string" && telefone.trim()
          ? telefone.trim()
          : null;
    }

    if (aceitou_termos !== undefined) {
      if (typeof aceitou_termos !== "boolean") {
        return res.status(400).json({
          message: "aceitou_termos deve ser true ou false."
        });
      }

      dados.aceitou_termos = aceitou_termos;
    }

    if (Object.keys(dados).length === 0) {
      return res.status(400).json({
        message: "Nenhum dado foi enviado para atualização."
      });
    }

    const usuario = await prisma.usuarios.update({
      where: { id },
      data: dados,

      select: {
        id: true,
        nome_completo: true,
        email: true,
        data_nascimento: true,
        telefone: true,
        aceitou_termos: true
      }
    });

    return res.status(200).json({
      message: "Usuário atualizado com sucesso!",
      usuario
    });

  } catch (error) {
    console.error("ERRO NO PUT /usuarios:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Usuário não encontrado."
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Este email já está cadastrado."
      });
    }

    return res.status(500).json({
      message: "Erro ao atualizar usuário."
    });
  }
});

// ========================================
// ROTA DELETE - DELETAR USUÁRIO
// ========================================

app.delete("/usuarios/:id", exigirChaveAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID inválido."
      });
    }

    await prisma.usuarios.delete({
      where: { id }
    });

    return res.status(200).json({
      message: "Usuário deletado com sucesso!"
    });

  } catch (error) {
    console.error("ERRO NO DELETE /usuarios:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Usuário não encontrado."
      });
    }

    return res.status(500).json({
      message: "Erro ao deletar usuário."
    });
  }
});

// ========================================
// ROTA POST - LOGIN
// ========================================

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body ?? {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof senha !== "string" ||
      !senha
    ) {
      return res.status(400).json({
        message: "Informe o email e a senha."
      });
    }

    const usuario = await prisma.usuarios.findUnique({
      where: {
        email: email.trim().toLowerCase()
      }
    });

    if (!usuario) {
      return res.status(401).json({
        message: "Email ou senha incorretos."
      });
    }

    // Comparar senha digitada com o hash armazenado
    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        message: "Email ou senha incorretos."
      });
    }

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      usuario: {
        id: usuario.id,
        nome_completo: usuario.nome_completo,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error("ERRO NO LOGIN:", error);

    return res.status(500).json({
      message: "Erro ao realizar login."
    });
  }
});

// ========================================
// ROTA NÃO ENCONTRADA
// ========================================

app.use((_req, res) => {
  return res.status(404).json({
    message: "Rota não encontrada."
  });
});

// ========================================
// TRATAMENTO DE ERROS
// ========================================

app.use((error, _req, res, _next) => {
  console.error("ERRO NA API:", error);

  if (error.message === "Origem não permitida pelo CORS.") {
    return res.status(403).json({
      message: "Origem não permitida."
    });
  }

  return res.status(500).json({
    message: "Erro interno do servidor."
  });
});

// ========================================
// EXPORTAR PARA A VERCEL
// ========================================

export default app;

// Executar servidor somente no ambiente local
if (process.env.VERCEL !== "1") {
  const servidor = app.listen(PORTA, () => {
    console.log("================================");
    console.log("MECÂNICA NA PRÁTICA");
    console.log(`Servidor rodando na porta ${PORTA}!`);
    console.log("================================");
  });

  process.on("SIGINT", async () => {
    await prisma.$disconnect();

    servidor.close(() => {
      process.exit(0);
    });
  });
}