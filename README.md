# Sistema de Gerenciamento de Usuários - Docker

Este é um projeto de gerenciamento de usuários em contêineres utilizando Docker e Docker Compose. A aplicação possui uma arquitetura baseada em microsserviços, onde cada componente roda em seu próprio contêiner isolado, comunicando-se por meio de redes virtuais do Docker.

A API do backend foi desenvolvida em **Python com o framework Flask**, e o frontend estático é servido por um servidor Nginx dedicado, com todas as comunicações centralizadas por um **Proxy Reverso** (também Nginx).

---

## 🛠️ Arquitetura do Sistema

A infraestrutura é composta por 4 serviços principais:

1. **Proxy Reverso (Nginx):** 
   - Ponto de entrada único da aplicação exposto na porta **8080** do host.
   - Distribui o tráfego de maneira inteligente:
     - Requisições na raiz `/` são direcionadas para o serviço de **Frontend**.
     - Requisições com o prefixo `/api/` são direcionadas para o serviço de **API (Backend)**, limpando o prefixo `/api`.

2. **Frontend:**
   - Servidor Nginx servindo páginas estáticas (HTML, CSS e JavaScript) na porta interna `80`.
   - Não expõe portas diretamente para o host, garantindo que o acesso ocorra exclusivamente pelo proxy reverso.

3. **API Backend (Python + Flask):**
   - API REST desenvolvida em Python (Flask) rodando na porta interna `5000`.
   - Conecta-se ao banco de dados MySQL para persistir e recuperar usuários.
   - Fornece endpoints para cadastro de usuários, listagem e verificação de saúde da aplicação (*health check*).

4. **Banco de Dados (MySQL):**
   - Banco de dados MySQL 8.0 rodando na porta interna `3306`.
   - Utiliza um volume persistente (`db_data`) para garantir que os dados não sejam perdidos quando os contêineres forem reiniciados ou removidos.
   - Inicializado automaticamente na primeira execução com o script [init.sql](file:///c:/Users/vitor/Documents/2026/Systems%20Analysis%20And%20Development/4AN/New%20Technologies/docker-project/init.sql).

---

## 🔌 Descrição das Portas Utilizadas

| Serviço / Container | Porta Interna (Container) | Porta Externa (Host) | Finalidade |
| :--- | :--- | :--- | :--- |
| **Proxy Reverso** (`docker_proxy`) | `80` | `8080` | Entrada de tráfego HTTP público unificado. |
| **API Backend** (`docker_api`) | `5000` | Não exposta | Processamento das regras de negócio e rotas da API. |
| **Frontend** (`docker_frontend`) | `80` | Não exposta | Servir a interface web estática para o proxy. |
| **MySQL** (`docker_mysql`) | `3306` | Não exposta | Armazenamento persistente de dados. |

---

## 📋 Pré-requisitos

Para executar este projeto, você precisará ter instalado em sua máquina:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para Windows ou macOS) ou a engine do Docker com [Docker Compose](https://docs.docker.com/compose/install/) (para Linux).

---

## 🚀 Instruções para Execução

### 1. Clonar ou Acessar a Pasta do Projeto
Certifique-se de estar na raiz do diretório do projeto no terminal:
```bash
cd "/c:/Users/vitor/Documents/2026/Systems Analysis And Development/4AN/New Technologies/docker-project"
```

### 2. Construir e Iniciar os Contêineres
Execute o comando abaixo para construir as imagens customizadas (da API) e inicializar todos os serviços em segundo plano (modo *detached*):
```bash
docker compose up -d --build
```

> 💡 **Nota:** O parâmetro `--build` garante que quaisquer alterações no código da API ou configurações sejam empacotadas na nova imagem antes da inicialização.

### 3. Verificar o Status dos Contêineres
Você pode conferir se todos os 4 serviços estão rodando normalmente com:
```bash
docker compose ps
```

### 4. Acessar a Aplicação
Abra seu navegador de preferência e acesse:
👉 **[http://localhost:8080](http://localhost:8080)**

> ⚠️ **IMPORTANTE:**
> **NÃO** abra o arquivo `index.html` diretamente (via duplo clique ou com extensões de editores como o *Live Server* do VS Code). Se fizer isso, a aplicação frontend tentará buscar a API na porta incorreta e causará erros de conexão ou erro `404 Not Found`. Acesse **obrigatoriamente** pela URL do proxy reverso: `http://localhost:8080`.

---

## 🧪 Testando os Endpoints da API

Você também pode testar os endpoints da API diretamente utilizando ferramentas como Postman, Insomnia, cURL ou pelo próprio navegador:

* **Health Check (Verificar se a API está online):**
  - **URL:** `GET http://localhost:8080/api/health`
  - **Resposta Esperada:** `{"status": "ok"}`

* **Listar Usuários Cadastrados:**
  - **URL:** `GET http://localhost:8080/api/users`

* **Cadastrar um Novo Usuário:**
  - **URL:** `POST http://localhost:8080/api/users`
  - **Headers:** `Content-Type: application/json`
  - **Payload (JSON):**
    ```json
    {
      "name": "João Silva",
      "email": "joao.silva@exemplo.com"
    }
    ```

---

## 🛑 Parando a Execução

Para parar e remover os contêineres ativos da aplicação, execute:
```bash
docker compose down
```

Caso você queira apagar também o volume persistente do banco de dados (reiniciando o banco para o estado original vazio):
```bash
docker compose down -v
```
