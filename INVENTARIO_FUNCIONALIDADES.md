# GUIA DEFINITIVO E INVENTÁRIO COMPLETO DA INTERFACE DO NEXUSAGENT

> **Documento:** Inventário Funcional e Descritivo Detalhado  
> **Perfil de Elaboração:** Analista de Produto Sênior & Engenheiro Front-end  
> **Finalidade:** Descrever minuciosamente cada aba, cada seção, cada caixa (box/card), cada campo de entrada, cada lista suspensa, cada botão, cada seletor e cada comportamento visual e funcional que o usuário final encontra ao navegar pelo NexusAgent.  
> **Arquitetura Base:** React 19, Tailwind CSS v4, Supabase (PostgreSQL + Auth + Storage) e Design System Apple/iOS Monochrome.

---

# VISÃO GERAL DO PRODUTO & NAVEGAÇÃO

O **NexusAgent** é uma plataforma de atendimento inteligente multicanal (SaaS) baseada no padrão visual **Apple/iOS Monochrome**. O sistema foi concebido para configurar e governar um agente autônomo de inteligência artificial conectado diretamente ao WhatsApp e ao Google Calendar.

A interface do usuário é dividida em um **Cabeçalho Fixo (Header)**, uma **Barra de Navegação por Abas (TabBar)** com 5 módulos principais, a **Área de Conteúdo Ativo (Page)**, uma **Barra Flutuante de Salvamento (FloatingSaveBar)** e um **Simulador de Conversa em Tempo Real (ChatDrawer)**.

---

# 1. ABA 1: CONEXÕES (`ConnectionsTab.tsx`)

Esta aba é o portal de integração física do NexusAgent com o mundo exterior. Sem ela, a inteligência artificial não tem um número de WhatsApp para receber/enviar mensagens nem uma agenda para consultar e reservar horários.

A tela é disposta em **dois grandes cards lado a lado**:

```
+-------------------------------------------------+-------------------------------------------------+
|  CARD 1: WHATSAPP                               |  CARD 2: GOOGLE AGENDA                          |
|  (Evolution API · Canal Principal)              |  (Google Calendar · Opcional para Reservas)     |
+-------------------------------------------------+-------------------------------------------------+
```

---

## 1.1 Box 1: WhatsApp (Evolution API · Canal Principal de Atendimento)

O WhatsApp é a porta de entrada obrigatória para a operação comercial do agente. O sistema utiliza a **Evolution API** como motor de mensageria subjacente.

### A. Quando o WhatsApp está DESCONECTADO:
1. **Ícone e Cabeçalho:**
   - Ícone de telefone celular em destaque.
   - Título: **"WhatsApp"**.
   - Subtítulo: **"Evolution API · Canal principal de atendimento"**.
2. **Área Informativa de Boas-Vindas:**
   - Texto explicativo: *"Conecte seu número para receber mensagens e permitir que o agente responda em tempo real aos seus clientes."*
   - **Notice Box (Destaque):** Uma caixa com borda arredondada e aviso: *"Canal necessário para publicar o agente"*, sinalizando ao usuário que o assistente não poderá ir ao ar sem um número ativo.
3. **Botões de Ação:**
   - **Botão Primário: "Gerar QR Code"** (Fundo preto, ícone de QR Code `QrCode`):
     - **O que acontece ao clicar:** Abre o modal de conexão rápida na tela.
     - **O que o modal exibe:**
       - Seletor no topo com duas abas: **"QR Code"** e **"Código de Pareamento"**.
       - Na opção QR Code, renderiza uma grade quadriculada estilizada com o símbolo de faísca (`Sparkles`) no centro.
       - Título de orientação: *"Leia o QR Code pelo WhatsApp"*.
       - Instruções passo a passo: *"Abra o WhatsApp no celular, toque em Configurações > Aparelhos conectados > Conectar aparelho e aponte a câmera."*
       - Indicador de status: Um spinner giratório cinza com o texto *"Aguardando leitura do código..."*.
       - Botão de simulação/teste: *"Simular leitura com sucesso"*, que ao ser clicado vincula a instância e fecha o modal.
   - **Botão Secundário: "Usar código de pareamento"** (Fundo branco, ícone de chave `KeyRound`):
     - **O que acontece ao clicar:** Abre o mesmo modal, porém já posicionado na aba **"Código de Pareamento"**.
     - **O que o modal exibe:**
       - Ícone de smartphone.
       - Título: *"Conectar com Código de Pareamento"*.
       - Texto explicativo: *"Ideal se você estiver operando no próprio celular ou sem câmera disponível no momento."*
       - **Campo de Texto com Máscara:** Rótulo *"Número do WhatsApp com DDD:"*, onde o usuário digita seu número (ex: `+55 (11) 99999-9999`).
       - **Box de Destaque com o Código:** Uma caixa cinza exibindo um código gerado de 8 caracteres em fonte monoespaçada grande (ex: **`NX84-92KL`**), com um botão **"Copiar"** (que vira **"Copiado!"** com ícone de check ao ser clicado).
       - **Instruções Numeradas:**
         1. *No celular, abra Aparelhos conectados.*
         2. *Toque em Conectar com número de telefone.*
         3. *Digite o código NX84-92KL gerado acima.*
       - Botão de simulação: *"Simular confirmação no celular"*.

### B. Quando o WhatsApp está CONECTADO:
1. **Painel de Perfil Conectado:**
   - **Avatar Monocromático:** Círculo com as iniciais *"NA"* (NexusAgent).
   - **Nome da Conexão:** *"Atendimento NexusAgent"*.
   - **Número de Telefone:** Exibe o número configurado (ex: `+55 11 99999-9999`).
   - **Identificador de Instância:** Texto discreto informando o identificador técnico da Evolution API (ex: `Instância: nexusagent-main`).
   - **Badge de Status:** Pílula verde com ponto pulsante escrito **"Online"**, confirmando a saúde da conexão WebSocket.
2. **Botão de Ação:**
   - **Botão Destrutivo: "Desconectar WhatsApp"** (Texto vermelho, contorno suave):
     - **O que acontece ao clicar:** Dispara uma janela modal de segurança (*ConfirmDialog*) alertando: *"Desconectar WhatsApp? Seu agente de IA deixará de responder aos clientes no WhatsApp imediatamente."*.
     - Se o usuário confirmar a desconexão, o número é desvinculado, a instância é pausada e o card volta imediatamente para o estado "Desconectado".

---

## 1.2 Box 2: Google Agenda (Google Calendar · Opcional para Reservas)

Permite sincronizar compromissos, checar conflitos de horários em tempo real e agendar atendimentos sem intervenção humana.

### A. Quando a Agenda está DESCONECTADA:
1. **Ícone e Cabeçalho:**
   - Ícone de calendário (`Calendar`).
   - Título: **"Google Agenda"**.
   - Subtítulo: **"Google Calendar · Opcional para reservas"**.
2. **Texto Explicativo:**
   - *"Consulte disponibilidade, crie eventos e permita cancelamentos ou reagendamentos sem intervenção manual da equipe."*
3. **Lista de Benefícios com Checks Verdes:**
   - **[✓] Consulta horários livres em tempo real:** A IA lê os slots ocupados da agenda pessoal do profissional e nunca oferece um horário conflitante.
   - **[✓] Agenda e envia convites automáticos:** Ao fechar a data no WhatsApp, a IA insere o evento no Google Calendar e envia o convite com link de videoconferência ou endereço para o e-mail do cliente.
   - **[✓] Bloqueia conflitos e horários ocupados:** Se alguém marcar um compromisso manual no Google Calendar, o robô automaticamente retira aquele horário da lista de opções do WhatsApp.
4. **Botão de Ação:**
   - **Botão Primário: "Conectar Google Calendar"** (Fundo preto, ícone de calendário):
     - **O que acontece ao clicar:** Abre o modal de autorização OAuth 2.0 do Google (*GoogleAuthModal*).
     - **O que o modal exibe:**
       - Eyebrow no topo: *"Google Workspace · OAuth2"*.
       - Título: *"Conectar Google Calendar"*.
       - Descrição: *"O NexusAgent poderá consultar horários livres, criar novos eventos autorizados e reagendar compromissos em tempo real."*
       - Três permissões explícitas listadas com checks verdes:
         1. *Visualizar eventos e consultar disponibilidade*
         2. *Criar e editar compromissos confirmados pelo cliente*
         3. *Remover horários cancelados e liberar agenda*
       - Botão: *"Continuar com a conta Google"*, que autoriza a sincronização e fecha o modal.

### B. Quando a Agenda está CONECTADA:
1. **Painel de Conta Conectada:**
   - **Avatar Sutil:** Círculo cinza claro com as iniciais *"GC"* (Google Calendar).
   - **E-mail Conectado:** Exibe o e-mail autenticado (ex: `contato@nexusagent.ai`).
   - **Status:** Texto *"Conta Google vinculada"*.
   - **Badge de Status:** Pílula verde com ponto pulsante escrito **"Sincronizado"**.
2. **Seletor de Agenda Ativa (Dropdown):**
   - **Rótulo:** *"Agenda ativa para agendamentos"*.
   - **Opções disponíveis para escolha:**
     - `Agenda principal`: Usa o calendário primário vinculado ao e-mail.
     - `Consultório`: Direciona apenas para a agenda profissional do consultório.
     - `Reuniões`: Direciona para um calendário exclusivo de reuniões corporativas.
3. **Botão de Ação:**
   - **Botão Destrutivo: "Desvincular agenda"** (Texto vermelho):
     - **O que acontece ao clicar:** Abre diálogo de confirmação avisando: *"O agente não poderá mais consultar disponibilidade ou criar novos agendamentos na sua agenda."*. Ao confirmar, a conta é desvinculada.

---

# 2. ABA 2: ATENDIMENTO E CONTATOS (`AttendanceTab.tsx`)

A aba **Atendimento & Contatos** é a central de governança das conversas. Aqui o usuário determina para quem o agente responde, quem deve ser ignorado, como a equipe humana assume o controle e em quais situações de emergência a IA deve pedir ajuda.

---

## 2.1 Box 1: Regras Gerais do Canal

Filtros de primeiro nível para impedir que o assistente passe vergonha em ambientes públicos:
1. **Switch "Ignorar mensagens de grupos":**
   - *O que está escrito:* "O agente nunca responderá nem interagirá em grupos de WhatsApp."
   - *Como funciona na prática:* Mesmo que o número do WhatsApp faça parte de grupos da família, do condomínio ou de empresas, o robô ignora 100% das mensagens desses grupos, poupando tokens e evitando mensagens constrangedoras.
2. **Switch "Ignorar respostas a Status e Stories":**
   - *O que está escrito:* "Reações e respostas a publicações visuais não iniciarão atendimento de IA."
   - *Como funciona na prática:* Quando alguém reage com um emoji de coração ou palmas a um status do WhatsApp, a IA não responde com "Olá, como posso ajudar?". Ela simplesmente ignora a reação.

---

## 2.2 Box 2: Modo de Operação (Quem a IA Pode Atender)

Permite definir a política de acesso à inteligência artificial por meio de **3 grandes Choice Cards** com botões de rádio selecionáveis:

```
+-----------------------------+-----------------------------+-----------------------------+
| [●] Responder todos         | [○] Todos, exceto sel.      | [○] Apenas selecionados     |
|     (Atendimento irrestrito)|     (Blacklist de bloqueio) |     (Whitelist VIP restrita)|
+-----------------------------+-----------------------------+-----------------------------+
```

1. **Opção 1: "Responder todos" (`all`):**
   - *Subtítulo:* "A IA atende qualquer pessoa que enviar uma mensagem."
   - *Comportamento:* A lista de exceções fica oculta. Qualquer número desconhecido ou salvo que mandar mensagem será imediatamente atendido pelo agente.
2. **Opção 2: "Todos, exceto selecionados" (`blacklist`):**
   - *Subtítulo:* "Bloqueie contatos específicos da automação."
   - *Comportamento:* A IA atende todo mundo, **MENOS** os números cadastrados na lista abaixo. Ideal para bloquear fornecedores chatos, familiares, ex-clientes, cobranças ou concorrentes.
3. **Opção 3: "Apenas selecionados" (`whitelist`):**
   - *Subtítulo:* "Restrinja a IA a uma lista autorizada de contatos."
   - *Comportamento:* A IA entra em modo "mudo" para todo o planeta, e responde **EXCLUSIVAMENTE** aos contatos cadastrados na lista abaixo. Ideal para pilotos controlados, atendimento VIP ou assistentes internos.

### O Gerenciador de Lista de Exceções (Aparece ao selecionar Blacklist ou Whitelist):
- **Contador Dinâmico:** Exibe no canto superior quantos contatos estão na lista (ex: *"2 contato(s) cadastrado(s)"*).
- **Formulário de Cadastro Rápido (`inline-form`):**
  - **Campo de Nome:** Placeholder *"Nome do contato"*.
  - **Campo de Telefone com Máscara:** Placeholder `+55 (00) 00000-0000` (conforme o usuário digita, o sistema formata automaticamente com parênteses e traço).
  - **Botão Primário: "Adicionar"** (com ícone `Plus`). Se os campos estiverem vazios, dispara um toast avisando o erro.
- **Lista dos Contatos Cadastrados:**
  - **Em Modo Normal:**
    - Mini avatar redondo com as 2 primeiras letras do nome (ex: "JS" para João Silva).
    - Nome em negrito e telefone abaixo.
    - **Badge Colorido:** Exibe **"Bloqueado"** (vermelho) se estiver em modo Blacklist, ou **"Autorizado"** (verde) se estiver em modo Whitelist.
    - **Botão Editar (Ícone de Lápis `Edit2`):** Transforma aquela linha específica em um formulário de edição inline.
    - **Botão Excluir (Ícone de Lixeira `Trash2`):** Abre modal de confirmação para remover o contato da lista.
  - **Em Modo de Edição Inline:**
    - O texto dá lugar a dois inputs compactos (um para corrigir o nome e outro para corrigir o telefone).
    - Botão verde com ícone de `Check` para salvar a alteração.
    - Botão neutro com ícone de `X` para cancelar a edição sem salvar.

---

## 2.3 Box 3: Pausa Humana & Intervenção (Anti-Atropelo de Atendentes)

Evita a situação desagradável em que um operador humano pega o celular para responder a um cliente e a IA continua respondendo por cima no mesmo segundo:
1. **Switch "Pausar IA ao responder pelo celular":**
   - *O que está escrito:* "Se alguém responder manualmente no WhatsApp, o agente silencia temporariamente."
   - *Como funciona na prática:* Quando o sistema detecta que uma mensagem saiu do celular sem ser gerada pela API do robô, ele "congela" a IA para aquele contato específico.
2. **Campo Numérico "Reativar IA automaticamente após":**
   - *Rótulo:* "Tempo de inatividade humana até que o robô volte a atender aquele contato."
   - *Input:* Campo tipo número com sufixo visual fixo **"horas"** (mínimo 1, padrão 24 horas).
   - *Como funciona:* Se o operador humano respondeu ao cliente e a conversa esfriou, após 24 horas (ou o tempo configurado) a IA volta a assumir o contato caso ele mande uma nova mensagem.
3. **Subseção: Contatos Recentes com Busca em Tempo Real:**
   - **Campo de Busca:** Input compacto com ícone de lupa e placeholder *"Buscar por nome ou DDD..."*. Filtra a lista instantaneamente enquanto o usuário digita.
   - **Lista de Atendimentos:**
     - Exibe clientes recentes (ex: Marina Costa, Rafael Martins, Bianca Lima).
     - Mostra o telefone e um badge: **"IA ativa"** (verde) ou **"Pausado"** (cinza).
     - **Switch Individual por Contato:** Um toggle verde individual que permite ao operador pausar ou reativar a IA manualmente para aquele cliente específico com apenas um clique, recebendo notificação em toast na hora.

---

## 2.4 Box 4: Transbordo Humano (Gatilhos de Emergência e Alerta)

Define em quais circunstâncias o robô deve reconhecer suas limitações, interromper o atendimento automático e chamar um humano para assumir o caso:
1. **Os 3 Checkboxes de Gatilhos:**
   - **[✓] Cliente solicitou atendente humano expressamente:** A IA monitora palavras como "falar com atendente", "humano", "atendente real", "pessoa", "gerente", etc. Ao identificar, ela para de responder e aciona a equipe.
   - **[✓] IA não soube responder a dúvida após 2 tentativas:** Se o robô tentou responder duas vezes e o cliente continuou sem entender ou a IA não encontrou o dado na base, ela não insiste em alucinar: aciona o transbordo.
   - **[✓] Cliente demonstrou irritação, urgência ou reclamação:** Análise de sentimento em tempo real. Se o cliente xingar, falar em processo, Procon, urgência médica ou indignação, o robô para na hora e transfere.
2. **Campo "WhatsApp para receber alertas e chamados":**
   - Input de texto com máscara: `+55 (00) 00000-0000`.
   - *Hint:* "Número que receberá a notificação com o resumo da conversa."
   - *Como funciona:* Quando um dos 3 gatilhos acima dispara, o NexusAgent envia uma mensagem para este número com o link da conversa e um resumo do que o cliente precisa.

---

# 3. ABA 3: HORÁRIOS E AGENDA (`ScheduleTab.tsx`)

Controla toda a inteligência temporal do assistente: quando a empresa abre, quando a equipe almoça, feriados nacionais, recesso e as regras matemáticas de agendamento de reuniões.

---

## 3.1 Box 1: Fuso Horário

- **Subtítulo Adaptativo:**
  - Se perfil **Pessoal**: *"Usado na sincronização de lembretes e compromissos pessoais."*
  - Se perfil **Empresa/Profissional**: *"Base de cálculo para o horário de funcionamento, atendimento e agendamentos."*
- **Select Dropdown "Fuso horário principal":**
  - Permite escolher a região horária para evitar que mensagens de bom dia ou confirmações de reunião sejam disparadas com horas de diferença:
    1. `America/Sao_Paulo (GMT-03:00)` — Brasília, São Paulo, Rio *(Padrão)*
    2. `America/Manaus (GMT-04:00)` — Manaus, Cuiabá, Campo Grande
    3. `America/Rio_Branco (GMT-05:00)` — Acre, Rio Branco
    4. `America/Noronha (GMT-02:00)` — Fernando de Noronha
    5. `Europe/Lisbon (GMT+00:00)` — Lisboa, Portugal
    6. `America/New_York (GMT-05:00)` — Nova York, EUA

---

## 3.2 Box 2: Grade Semanal de Funcionamento / Disponibilidade

- **Título Dinâmico:** "Grade semanal de disponibilidade pessoal" (no perfil Pessoal) ou "Grade semanal de funcionamento" (nos perfis Empresa e Profissional).
- **Botão de Atalho Rápido: "Replicar segunda até sexta"** (Ícone de cópia `Copy`):
  - Ao clicar, o sistema copia as configurações exatas da Segunda-feira (aberto/fechado, horário de expediente e almoço) para Terça, Quarta, Quinta e Sexta com um único clique.
- **Estrutura dos 7 Dias da Semana (Segunda a Domingo):**
  Cada dia da semana é uma linha independente contendo:
  - **Switch do Dia:** Liga ou desliga o atendimento naquele dia da semana.
  - **Nome do Dia:** Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo.
  - **Se o dia estiver DESLIGADO:** Exibe o aviso em cinza *"Sem atendimento (Fechado)"*.
  - **Se o dia estiver LIGADO:**
    - **Horário de Início:** Campo tipo hora (ex: `08:00`).
    - Texto separador *"até"*.
    - **Horário de Término:** Campo tipo hora (ex: `18:00`).
    - **Switch "Pausa" (Almoço/Intervalo):**
      - Se desmarcado: Exibe *"Sem intervalo"*.
      - Se marcado: Abre dois campos de hora adicionais para o início do almoço (ex: `12:00`) até o fim do almoço (ex: `13:30`).
  - **Validador de Coerência de Horários em Tempo Real:** Se o usuário colocar o horário de término menor que o de início (ex: das 18:00 às 08:00) ou colocar o almoço fora do expediente, o sistema emite um alerta sonner amarelo na tela avisando o erro.

---

## 3.3 Box 3: Feriados e Datas Bloqueadas

Permite cadastrar dias em que a empresa ou o profissional não atenderá, além dos fins de semana normais:
1. **Switch "Aplicar feriados nacionais automaticamente":**
   - *O que está escrito:* "Considera feriados oficiais brasileiros como dias de recesso." (Padrão: `true`).
   - *Como funciona:* Em dias como 1º de Janeiro, Tiradentes, Natal, etc., a IA assume automaticamente o comportamento de "Fechado" sem que o usuário precise cadastrar manualmente.
2. **Formulário de Nova Data Bloqueada:**
   - **Campo de Data:** Seletor de calendário tipo `date` para escolher o dia.
   - **Campo de Motivo:** Input de texto (placeholder: *"Motivo (ex: Recesso de Carnaval)"*).
   - **Botão "Adicionar"** (Ícone `Plus`): Adiciona o feriado à lista (com trava automática que impede cadastrar duas vezes a mesma data).
3. **Lista de Datas Bloqueadas:**
   - **Date Badge:** Um bloco quadrado elegante destacando o dia em tamanho grande e o mês/ano abaixo.
   - **Texto:** Motivo do bloqueio (ex: "Recesso de fim de ano") + rótulo *"Dia inteiro bloqueado"*.
   - **Botão Editar (Lápis):** Abre os campos inline para alterar a data ou o motivo.
   - **Botão Excluir (Lixeira):** Pede confirmação e remove a data bloqueada.

---

## 3.4 Box 4: Comportamento Fora de Hora (Almoço, Madrugadas e Feriados)

Define a política de atendimento quando alguém manda mensagem fora do expediente:
1. **Select Dropdown "Durante a pausa de almoço":**
   - *Opção 1:* **"Atender normal sem avisar"** — A IA atende como se estivesse em expediente normal.
   - *Opção 2:* **"Atender e avisar quando a equipe retorna"** *(Padrão)* — A IA responde às dúvidas, mas avisa: *"Nossa equipe está em horário de almoço e retorna às 13:30"*.
   - *Opção 3:* **"Enviar apenas mensagem fixa de almoço"** — A IA não dialoga, apenas dispara uma mensagem automática avisando o intervalo.
2. **Select Dropdown "Fora do expediente comercial e feriados":**
   - *Opção 1:* **"Atendimento IA 24/7 normal (Recomendado)"** — A IA atende dia e noite, tira dúvidas, apresenta catálogo e agenda horários livremente.
   - *Opção 2:* **"Atender e agendar, mas avisar que está fechado"** *(Padrão)* — A IA atende e permite agendar, mas pontua que a loja física ou escritório está fechado no momento.
   - *Opção 3:* **"Enviar mensagem única de ausência"** — A IA não conversa, apenas envia uma mensagem padrão avisando que responderá no próximo dia útil.
   - *Opção 4:* **"Ficar totalmente mudo"** — O robô não envia nenhuma resposta durante a noite ou fins de semana.
3. **Campo Condicional Textarea "Mensagem de ausência personalizada":**
   - Aparece na tela **somente se** o usuário escolher a *Opção 3* acima.
   - Permite redigir o texto exato da mensagem de ausência (padrão: *"Olá! No momento estamos fora do horário de atendimento, mas sua mensagem foi registrada e retornaremos em breve."*).

---

## 3.5 Box 5: Regras Finas de Agendamento (Parâmetros de Calendário)

O cérebro que comanda como as vagas da agenda são calculadas:
- **Aviso de Alinhamento:** Se o Google Calendar ainda não estiver conectado, exibe um banner amarelo amigável: *"Google Agenda ainda não conectado. Você pode parametrizar todas as regras agora e vincular a conta Google depois na aba Conexões."*
- **Campos de Controle:**
  1. **Segmented Control "Duração padrão de cada atendimento":**
     - Quatro opções de pílula: `30 min`, `45 min`, `1 hora`, `Por serviço`.
     - Se escolher `Por serviço`, a IA buscará a duração cadastrada na tabela de catálogo da Aba 5 para cada procedimento específico.
  2. **Select Dropdown "Intervalo entre reuniões (buffer)":**
     - Opções: `Nenhum`, `10 min`, `15 min`, `30 min`.
     - *O que faz:* Cria uma margem de respiro entre um cliente e outro para evitar que atrasos encavalem a agenda.
  3. **Input Numérico "Antecedência mínima para agendar":**
     - Campo numérico com sufixo visual fixo **"horas"** (mínimo 0, padrão 2 horas).
     - *O que faz:* Impede que um cliente mande mensagem às 14:25 querendo marcar um horário para as 14:30. A IA só oferece horários com pelo menos 2 horas de folga.
  4. **Input Numérico "Janela máxima futura":**
     - Campo numérico com sufixo visual fixo **"dias"** (mínimo 1, padrão 30 dias).
     - *O que faz:* Limita a antecedência com que o cliente pode marcar. Se estiver em 30 dias, a IA não permite agendar para daqui a 6 meses.
  5. **Checkboxes de "Dados obrigatórios antes de confirmar reserva":**
     - Quatro opções marcáveis lado a lado:
       - `[✓] Nome completo`
       - `[✓] CPF`
       - `[✓] E-mail`
       - `[✓] Serviço / motivo`
     - *Como funciona:* A IA é instruída a só fechar a reunião após coletar cada um dos campos marcados.
  6. **Switch "Permitir cancelamentos e reagendamentos pelo WhatsApp":**
     - *Descrição:* "O agente poderá consultar compromissos existentes e sugerir novos horários mediante validação do nome ou documento." (Padrão: `true`).

---

# 4. ABA 4: IDENTIDADE E COMPORTAMENTO (`IdentityTab.tsx`)

Define como o agente fala, quem ele finge ser, seu grau de humanização e as barreiras que ele nunca pode ultrapassar.

---

## 4.1 Box 1: Identidade e Papel

1. **Campo de Texto "Nome do agente":**
   - Placeholder: *"Ex: Sofia, Lucas, Atendente Nexus"*.
   - Define o nome que o robô usará para se referir a si mesmo nas conversas (Padrão: `"Sofia"`).
2. **Switch "Apresentar-se pelo nome na primeira mensagem":**
   - *Exemplo exibido:* *"Olá! Sou a Sofia da Clínica Aurora..."* (Padrão: `true`).
3. **Switch "Informar explicitamente que é uma assistente de IA":**
   - *Descrição:* *"Adiciona transparência conforme diretrizes éticas e de compliance."* (Padrão: `false`).
   - Se ligado, a IA se apresenta avisando que é uma assistente virtual automatizada.

---

## 4.2 Box 2: Personalidade e Estilo

1. **Seletor de Pílulas "Tom de voz" (5 Opções Exclusivas):**
   - `Profissional`: Linguagem formal, polida, séria, ideal para advocacia, contabilidade e consultoria de alta renda.
   - `Amigável` *(Padrão)*: Acolhedor, caloroso, atencioso, ideal para clínicas, consultórios e estética.
   - `Direto`: Respostas objetivas, curtas, sem rodeios, ideal para suporte técnico e operações B2B ágeis.
   - `Descontraído`: Jovem, animado, informal, ideal para barbearias, marcas de moda e alimentação.
   - `Consultivo / Vendedor`: Persuasivo, focado em benefícios, contorno de objeções e condução para fechamento.
2. **Slider "Tamanho padrão das respostas":**
   - Barra deslizante de 10 a 100 palavras (com passos de 5 em 5).
   - Rótulo esquerdo: **"Curto & Direto"**; Rótulo direito: **"Detalhado & Explicativo"** (Padrão: 35 palavras).
   - Evita que a IA mande respostas monossilábicas ("sim", "não") ou paredes gigantes de texto que ninguém lê no WhatsApp.
3. **Segmented Control "Uso de emojis nas mensagens":**
   - Três opções: `Nenhum`, `Moderado` *(Padrão)*, `Frequente`.
   - Controla a densidade de emojis (ex: 😊, 📅, ✨) nas frases.

---

## 4.3 Box 3: Objetivo Principal do Agente

Um grid horizontal de 5 grandes botões de rádio selecionáveis que orientam a estratégia de conversão:
1. **"Agendamento"** *(Padrão)* — Foco obsessivo em verificar horários livres e fechar a consulta/reunião na agenda.
2. **"Tira-dúvidas & Suporte"** — Foco em responder dúvidas com base no FAQ e nos arquivos enviados, sem forçar vendas.
3. **"Vendas & Conversão"** — Foco em valorizar o produto do catálogo, quebrar objeções e enviar a chave PIX ou link de pagamento.
4. **"Qualificação de Leads"** — Foco em fazer perguntas diagnósticas para entender o perfil do cliente antes de transferir para a equipe.
5. **"Recepção Pessoal"** — Foco em filtrar mensagens, anotar recados importantes e proteger o tempo livre do titular.

---

## 4.4 Box 4: Humanização no WhatsApp (Comportamento Orgânico)

Garante que o cliente sinta que está falando com uma pessoa real:
1. **Slider "Agrupamento de mensagens picadas (Debounce)":**
   - Barra deslizante de 3 a 30 segundos (Padrão: 10 segundos).
   - Rótulo esquerdo: *"3s (Rápido)"*; Rótulo direito: *"30s (Mais calmo)"*.
   - *Como funciona:* Quando uma pessoa manda várias mensagens curtas seguidas no WhatsApp ("Oi", "Tudo bem?", "Você tem horário pra amanhã?"), a IA não responde 3 vezes seguidas: ela aguarda os segundos configurados após a última mensagem para formular uma resposta única e completa.
2. **Switch "Dividir respostas longas em múltiplos balões":**
   - Quebra textos longos em 2 ou 3 balões menores enviados consecutivamente, simulando a digitação humana natural.
3. **Switch "Simular status 'Digitando...' e 'Gravando áudio...'":**
   - Exibe o indicador verde oficial *"digitando..."* no topo do WhatsApp enquanto a inteligência artificial processa a resposta.
4. **Switch "Transcrever e responder mensagens de voz":**
   - Se o cliente enviar um áudio no WhatsApp, a IA transcreve o áudio internamente, compreende o pedido e responde normalmente em texto.
5. **Switch "Analisar imagens e fotos de comprovantes":**
   - Utiliza visão computacional para ler comprovantes de PIX, fotos de receitas médicas ou documentos enviados pelo cliente.

---

## 4.5 Box 5: Guardrails (Regras Proibidas Invioláveis)

A "camisa de força" da IA para impedir processos judiciais, prejuízos e quebras de conformidade:
1. **As 4 Regras Proibidas Padrão (Checkboxes):**
   - `[✓] Nunca inventar preços ou horários` — Impede que a IA alucine valores que não estão no catálogo.
   - `[✓] Nunca conceder descontos não cadastrados` — Impede que clientes convençam o robô a dar 50% de desconto.
   - `[✓] Nunca opinar sobre temas sensíveis ou fora do escopo` — Política, religião, futebol, polêmicas da internet.
   - `[✓] Nunca dar diagnósticos técnicos ou médicos definitivos` — A IA pode acolher e agendar, mas nunca emitir laudos.
2. **Formulário de Regra Proibida Personalizada:**
   - Input de texto: *"Adicionar regra proibida personalizada..."*.
   - Botão **"Adicionar"** (Ícone `Plus`): Permite ao usuário ditar regras estritas próprias (ex: *"Nunca prometer entrega para o mesmo dia após as 14h"*).
3. **Lista de Regras Customizadas:**
   - Exibe as regras criadas pelo usuário, cada uma com botão de lixeira vermelha para remoção.

---

## 4.6 Box 6: Instruções Livres (System Prompt)

- **Seletor de Templates Prontos (`template-select`):**
  - Um dropdown no cabeçalho com 5 modelos completos pré-configurados:
    1. `Clínica / Consultório`: Roteiro empático de triagem e agendamento médico.
    2. `Loja / Comércio`: Roteiro comercial enérgico focado em vendas e pagamento.
    3. `Barbearia / Estética`: Roteiro dinâmico com escolha de profissional e serviços.
    4. `Escritório / Advocacia`: Roteiro formal com triagem de área jurídica e sigilo.
    5. `Uso Pessoal`: Roteiro de assistente executivo e filtro de prioridades.
  - Ao clicar em qualquer opção, o sistema preenche imediatamente a caixa de texto abaixo com o modelo.
- **Textarea de System Prompt Livre:**
  - Uma área de texto ampla onde o usuário pode escrever livremente toda a história da sua marca, instruções secretas, política de trocas, orientações aos clientes e particularidades do seu nicho.

---

# 5. ABA 5: CONHECIMENTO E DADOS DO PERFIL (`KnowledgeBaseTab.tsx`)

Esta é a aba mais rica e adaptativa do sistema. Ela muda completamente seu título, subtítulo e campos estruturados com base no **Tipo de Conta (`account_type`)** do usuário, garantindo que um médico não veja campos de "Chave PIX de e-commerce" e que uma loja não veja campos de "Registro no CRM".

Além disso, os dados de cada um dos 3 perfis ficam **estritamente isolados no banco de dados**, garantindo que se o usuário alterar seu perfil mais tarde nas configurações, **nenhum dado cadastrado anteriormente seja sobrescrito (Zero Data Bleeding)**.

---

## 5.1 PERFIL 1: EMPRESA (`account_type === 'company'`)
* **Nome exibido na Aba (TabBar):** *"Empresa & Conhecimento"*
* **Título do Card 1:** *"Dados da empresa"*
* **Subtítulo:** *"Contexto institucional usado em cada conversa."*

### A. Campos Estruturados da Empresa:
1. **Input "Nome fantasia da empresa":** Placeholder *"Ex: Clínica Aurora"*. Nome comercial que o robô falará ao cliente.
2. **Input "Endereço físico de atendimento":** Placeholder *"Av. Paulista, 1000 — São Paulo, SP"*. Endereço do estabelecimento presencial.
3. **Input "Link do Google Maps":** URL direta para o cliente abrir a rota no GPS do celular.
4. **Textarea "Resumo institucional do negócio":** Descrição do que a empresa faz, diferenciais, tempo de mercado e proposta de valor.
5. **Switch "Operação 100% online":**
   - *O que faz:* Se ativado, a caixa de endereço físico fica automaticamente desabilitada e cinza, e a IA é instruída a informar que o negócio atua exclusivamente via internet.
6. **Input "Instagram ou Website principal":** Campo para `@usuario` ou URL (ex: `https://minhaloja.com.br`).
7. **Checkboxes "Formas de pagamento aceitas":**
   - Quatro opções marcáveis: `[✓] PIX`, `[✓] Cartão`, `[✓] Boleto`, `[✓] Dinheiro`.
   - A IA informa aos clientes apenas as opções marcadas aqui.
8. **Input "Chave PIX para envio automático":** Placeholder *"financeiro@empresa.com.br ou CNPJ"*. Chave compartilhada pela IA quando o cliente pede os dados para pagar.

### B. Tabela do Catálogo de Produtos e Serviços:
- **Título do Card:** *"Produtos e serviços"*
- **Subtítulo:** *"Informações estruturadas permitem ao agente responder sobre preços, prazos e condições com precisão milimétrica."*
- **Botão no Topo:** **"Adicionar item"** (Botão preto com ícone `Plus`).
- **Colunas Interativas da Tabela:**
  1. **Nome do item:** Input de texto (ex: "Consulta Inicial", "Corte Masculino", "Camiseta Básica").
  2. **Preço:** Input de texto livre com suporte a moedas (ex: "R$ 150", "A partir de R$ 80", "Sob consulta").
  3. **Duração:** Input numérico com sufixo visual fixo `"min"` (ex: 30, 45, 60). Usado no agendamento para bloquear tempo na agenda.
  4. **Descrição e orientações de preparo:** Input longo com orientações que a IA repassa (ex: "Jejum de 8 horas", "Chegar 10 minutos antes").
  5. **Ação de Exclusão:** Botão com ícone de lixeira vermelha (`Trash2`), que aciona modal de confirmação antes de apagar o produto.

---

## 5.2 PERFIL 2: PROFISSIONAL AUTÔNOMO (`account_type === 'professional'`)
* **Nome exibido na Aba (TabBar):** *"Meu Perfil & Serviços"*
* **Título do Card 1:** *"Perfil profissional"*
* **Subtítulo:** *"Credenciais, especialidade e informações de atendimento."*

### A. Campos Estruturados do Profissional:
1. **Input "Nome profissional completo":** Placeholder *"Ex: Dra. Camila Alencar"*. Nome pelo qual o especialista é conhecido.
2. **Input "Registro profissional (CRM, OAB, CRP...)":** Placeholder *"Ex: CRM/SP 123.456"*. Número de conselho de classe que dá autoridade e respaldo legal à atuação do profissional.
3. **Input "Especialidade de atuação":** Placeholder *"Ex: Psicologia Clínica ou Direito Tributário"*.
4. **Input "Endereço do consultório / escritório":** Placeholder *"Rua Oscar Freire, 300 — Sala 42"*. Local físico das consultas ou reuniões.
5. **Input "Links profissionais (Linktree, LinkedIn, Site)":** URL para portfólio, artigos ou agendador externo.
6. **Input "Formas de pagamento aceitas (separadas por vírgula)":** Campo flexível onde o profissional digita suas opções (ex: *"PIX, Cartão de Crédito, Transferência, Recibo para Reembolso"*).

### B. Tabela de Serviços e Procedimentos:
- **Título do Card:** *"Serviços e procedimentos"*
- **Estrutura idêntica à tabela de catálogo**, porém voltada para consultas, sessões terapêuticas, pareceres jurídicos ou mentorias técnicas (com nome do serviço, honorários, tempo de sessão em minutos, orientações prévias e botão de excluir).

---

## 5.3 PERFIL 3: PESSOAL (`account_type === 'personal'`)
* **Nome exibido na Aba (TabBar):** *"Sobre Mim & Contexto"*
* **Título do Card 1:** *"Sobre você"*
* **Subtítulo:** *"Contexto pessoal para uma assistência realmente útil."*

### A. Campos Estruturados Pessoais:
1. **Input "Meu nome de apresentação":** Placeholder *"Ex: Lucas Mendonça"*. Como o assistente deve se referir ao seu "chefe" ao falar com outras pessoas.
2. **Input "Cidade / Localização base":** Placeholder *"São Paulo, SP"*. Ajuda a IA a situar compromissos no fuso e na região correta.
3. **Input "Links úteis (Agenda, Portfólio)":** Placeholder *"linkedin.com/in/seunome"*.
4. **Textarea "Resumo / Bio pessoal":** Espaço para descrever sua rotina, projetos atuais, família ou contexto de trabalho.
5. **Textarea "Tópicos e assuntos prioritários":** Placeholder *"Reuniões, mentorias, palestras, convites para podcasts..."*. Orienta o assistente sobre o que deve ser considerado prioridade alta e o que deve ser descartado.

### B. Tabela de Atividades e Projetos:
- **Título do Card:** *"Atividades e projetos"*
- **Estrutura adaptada para compromissos pessoais:** Permite cadastrar formatos de reuniões (ex: "Café de Negócios", "Call de Alinhamento", "Sessão de Mentoria"), com duração estimada em minutos, condições e orientações ao convidado.

---

## 5.4 Componentes Comuns a Todos os 3 Perfis na Aba 5

Independentemente do perfil escolhido, a parte inferior da Aba 5 sempre apresenta duas seções essenciais para a inteligência da IA:

```
+-------------------------------------------------+-------------------------------------------------+
|  FAQ RÁPIDO                                     |  DOCUMENTOS E MEMÓRIA (RAG)                     |
|  (Perguntas e Respostas Aprovadas)              |  (Base de Arquivos PDF, DOCX, TXT)              |
+-------------------------------------------------+-------------------------------------------------+
```

### A. Card: FAQ Rápido (Perguntas e Respostas Padronizadas)
Elimina a necessidade de a IA ter que adivinhar respostas para dúvidas recorrentes dos clientes:
1. **Lista Expansível em Acordeão (`details.faq`):**
   - **Visual Fechado:** Rótulo em cinza *"Quando perguntarem:"* acompanhado da pergunta em negrito (ex: *"Vocês atendem aos sábados?"*).
   - **Visual Aberto:** Ao clicar, expande suavemente exibindo a resposta oficial aprovada (ex: *"Sim, atendemos aos sábados das 08h às 12h mediante agendamento prévio."*).
   - **Botão Editar (Ícone `Edit2`):** Abre a pergunta e resposta em modo de edição inline, com botões para "Salvar" ou "Cancelar".
   - **Botão Excluir (Ícone `Trash2`):** Abre modal de confirmação para deletar a pergunta da base da IA.
2. **Formulário de Inclusão de Nova FAQ (`faq-form`):**
   - **Campo de Pergunta:** Input de texto com placeholder *"Nova pergunta (ex: Aceitam convênio médico?)"*.
   - **Campo de Resposta:** Textarea com placeholder *"Resposta aprovada que o agente deve repassar..."*.
   - **Botão Secundário:** **"Adicionar pergunta ao FAQ"** (Ícone `Plus`). Valida se ambos os campos estão preenchidos antes de salvar.

### B. Card: Documentos e Memória (RAG — Retrieval-Augmented Generation)
Permite subir manuais, PDFs, tabelas de preços e termos para que a IA faça buscas semânticas profundas antes de responder:
1. **Área Interativa de Dropzone:**
   - Caixa com borda pontilhada, ícone de nuvem (`UploadCloud`) e textos de instrução:
     - **"Arraste arquivos ou clique para enviar"**
     - Subtítulo: *"PDF, DOCX ou TXT · até 10 MB cada documento"*
   - Suporta arrastar e soltar arquivos diretamente da área de trabalho do computador ou clicar para abrir a janela de seleção de arquivos do Windows/Mac.
2. **Lista de Documentos Indexados:**
   - Ícone quadrado de documento cinza (`DOC`).
   - Nome original do arquivo (ex: `Guia-de-atendimento.pdf`).
   - Tamanho formatado em MB (ex: `1.8 MB`).
   - **Badge Verde:** Pílula verde com ponto escrito **"Treinado"**, garantindo ao usuário que o conteúdo já foi fatiado e indexado na memória da IA.
   - **Botão Excluir (`Trash2`):** Abre modal de confirmação destrutiva avisando que o arquivo será desindexado e a IA deixará de consultar seu conteúdo nas conversas.

---

# 6. COMPONENTES GLOBAIS DE INTERAÇÃO, NAVEGAÇÃO E HEADER

Para completar o inventário, os componentes visuais que acompanham o usuário em qualquer aba:

### 6.1 O Cabeçalho Superior Fixo ([`Header.tsx`](file:///C:/Users/henri/Desktop/Henri/Projetos/Sitemas/NexusAgent/src/components/layout/Header.tsx))
- **Marca NexusAgent:** Símbolo preto com brilho (`Sparkles`) e texto em negrito que serve como atalho para voltar à tela inicial.
- **Chips de Status com Atalhos:**
  - Pílula do **WhatsApp:** Ponto verde/cinza com texto "WhatsApp". Se estiver desconectado, um clique abre o modal de pareamento; se conectado, abre a aba Conexões.
  - Pílula da **Google Agenda:** Ponto verde/cinza com texto "Agenda". Abre o modal de sincronização se desconectado.
- **Botão de Ação Mestre: Ligar / Pausar Agente:**
  - Se o agente estiver **Pausado/Desligado:** Botão preto primário com ícone `Power`, ponto cinza e texto **"Ativar Agente"**.
  - Se o agente estiver **Ativo/Ligado:** Botão branco secundário com ícone `PowerOff`, ponto verde pulsante (`#34c759`) e texto **"Pausar Agente"** (com transição para hover avermelhado indicando ação de pausa).
- **Avatar e Menu Dropdown de Perfil ([`ProfileDropdown.tsx`](file:///C:/Users/henri/Desktop/Henri/Projetos/Sitemas/NexusAgent/src/components/layout/ProfileDropdown.tsx)):**
  - Botão redondo no cabeçalho exibindo a foto real enviada para o Supabase Storage ou as duas iniciais do nome com tipografia idêntica (`UserAvatar sm`).
  - Ao clicar, abre o menu suspenso Apple Monochrome:
    - **Upload de Foto:** Botão "Enviar" ou "Trocar", enviando arquivos de imagem direto para o bucket `avatars` do Supabase Storage (com botão de lixeira para remover a foto).
    - **Edição de Nome Completo:** Input de texto com botão "Salvar Nome".
    - **Card de Tipo de Conta:** Mostra o perfil atual (ex: "Conta Empresa") com botão **"Configurações"**, que abre o modal [`AccountSettingsModal.tsx`](file:///C:/Users/henri/Desktop/Henri/Projetos/Sitemas/NexusAgent/src/components/modals/AccountSettingsModal.tsx) permitindo ao usuário alterar seu perfil sem perda de dados.
    - **Alteração de Senha Segura:** Acordeão que pede a "Senha Atual", "Nova Senha" e "Confirmar Nova Senha", validando a autenticação no Supabase Auth.
    - **Botão Sair da Conta (Logout):** Texto em vermelho com ícone `LogOut` para encerrar a sessão com segurança.

### 6.2 Barra Flutuante de Salvamento Reativo ([`FloatingSaveBar.tsx`](file:///C:/Users/henri/Desktop/Henri/Projetos/Sitemas/NexusAgent/src/components/layout/FloatingSaveBar.tsx))
- Fica invisível enquanto o usuário não mexe em nada.
- Ao alterar qualquer vírgula em qualquer aba, a barra surge suavemente animada na parte inferior da tela, informando que existem alterações não salvas.
- **Botão "Descartar":** Cancela tudo e restaura os valores que estão salvos na nuvem.
- **Botão "Salvar alterações":** Valida todos os campos com o schema Zod e executa um UPSERT seguro na tabela `agent_configs` do Supabase.

### 6.3 Gaveta de Teste com IA em Tempo Real ([`ChatDrawer.tsx`](file:///C:/Users/henri/Desktop/Henri/Projetos/Sitemas/NexusAgent/src/components/modals/ChatDrawer.tsx))
- Uma gaveta lateral que se abre simulando uma conversa de WhatsApp com o assistente, permitindo ao usuário testar suas regras, produtos e tom de voz antes de colocar o agente para falar com clientes reais.

### 6.3 Gaveta de Teste com IA em Tempo Real ([`ChatDrawer.tsx`](file:///C:/Users/henri/Desktop/Henri/Projetos/Sitemas/NexusAgent/src/components/modals/ChatDrawer.tsx))
- Uma gaveta lateral que se abre simulando uma conversa de WhatsApp com o assistente, permitindo ao usuário testar suas regras, produtos e tom de voz antes de colocar o agente para falar com clientes reais.

