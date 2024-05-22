// Role.ts
export enum Role {
  Adm = "Adm",
  User = "User",
}

export enum RolePessoa {
  Inquilino = "Inquilino",
  Proprietario = "Proprietario",
  Vistoriador = "Vistoriador",
}
// Tipo_Imovel.ts
export enum Tipo_Imovel {
  Casa = "Casa",
  Apartamento = "Apartamento",
  Terreno = "Terreno",
  Lote = "Lote",
  Ponto = "Ponto",
  Rural = "Rural",
}

// Tipo_Comodo.ts
export enum Tipo_Comodo {
  Sala = "Sala",
  Cozinha = "Cozinha",
  Quarto = "Quarto",
  Banheiro = "Banheiro",
  Servico = "Servico",
  Sacada = "Sacada",
  Escada = "Escada",
  Porao = "Porao",
  Copa = "Copa",
  Corredor = "Corredor",
  Garagem = "Garagem",
  Outro = "Outro",
}

// Tipo_Componente.ts
export enum Tipo_Componente {
  Piso = "Piso",
  Parede = "Parede",
  Interruptor = "Interruptor",
  Tomada = "Tomada",
  Teto = "Teto",
  Rodape = "Rodape",
  Base = "Base",
  Porta = "Porta",
  Janela = "Janela",
  Macaneta = "Macaneta",
  Fechadura = "Fechadura",
  Item = "Item",
}

// Cor.ts
export enum Cor {
  Branco = "Branco",
  Preto = "Preto",
  Cinza = "Cinza",
  Vermelho = "Vermelho",
  Azul = "Azul",
  Verde = "Verde",
  Amarelo = "Amarelo",
  Marrom = "Marrom",
  Laranja = "Laranja",
  Roxo = "Roxo",
  Rosa = "Rosa",
  Outro = "Outro",
}

// Estado.ts
export enum Estado {
  IP = "IP",
  IA = "IA",
  NP = "NP",
  NA = "NA",
  UP = "UP",
  UA = "UA",
}

// Material.ts
export enum Material {
  Madeira = "Madeira",
  Alvenaria = "Alvenaria",
  Metal = "Metal",
  Vidro = "Vidro",
  Outro = "Outro",
}

// types.ts

export interface DadosVistoria {
  id: string;
  data: Date;
  imovel: {
    rua: string;
    numero: number;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    comodo: {
      numero: number;
      tipo: string;
      componente: {
        tipo: string;
        estado: string;
      }[];
    }[];
  };
}
