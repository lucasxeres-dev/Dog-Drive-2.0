# Contas de Teste - Dog Drive

## Como Usar

1. Execute a migration SQL: `supabase_migrations/create_business_profiles.sql` no Supabase Dashboard
2. Use as credenciais abaixo para testar cada perfil

## Credenciais de Teste

### 1. Owner (Dono de Pet)
```
Email: owner@teste.com
Senha: teste123
Tem cão cadastrado: Sim (via onboarding)
```

### 2. Walker (Passeador Individual)
```
Email: walker@teste.com
Senha: teste123
Tipo: Indiv

idual/Profissional
```

### 3. Petshop
```
Email: petshop@teste.com
Senha: teste123

Dados Empresariais:
- NIF: 123456789
- Nome da Empresa: PetShop Amigo Ltda
- Email Comercial: contato@petshopamligo.com
- Telefone: (11) 3333-3333
- Endereço: Rua das Flores, 123, São Paulo, SP
- IVA: Sim
```

### 4. Banho e Tosa (Grooming)
```
Email: grooming@teste.com
Senha: teste123

Dados Empresariais:
- NIF: 987654321
- Nome da Empresa: Banho & Tosa Premium
- Email Comercial: contato@banhoetosa.com
- Telefone: (11) 4444-4444
- Endereço: Av. Principal, 456, Rio de Janeiro, RJ
- IVA: Sim
```

### 5. Hospedagem (Boarding)
```
Email: boarding@teste.com
Senha: teste123

Dados Empresariais:
- NIF: 555666777
- Nome da Empresa: Hotel Pet Paradise
- Email Comercial: reservas@petparadise.com
- Telefone: (11) 5555-5555
- Endereço: Rua do Campo, 789, Curitiba, PR
- IVA: Não
```

## Criar Contas Manualmente

**Passo a Passo:**

1. Vá para `/register`
2. Selecione o tipo de perfil
3. Preencha dados pessoais (Step 2)
4. Se business (petshop/grooming/boarding): Preencha dados empresariais (Step 3)
5. Click "Finalizar Cadastro"
6. Vá para `/login` e faça login

## Verificar no Supabase

### Tabela: auth.users
Deve ter 5 usuários com os emails acima

### Tabela: profiles
Deve ter 5 perfis com roles: owner, walker, petshop, grooming, boarding

### Tabela: business_profiles
Deve ter 3 empresas (petshop, grooming, boarding) com NIFs únicos

## Testar Funcionalidades

- **Owner:** Onboarding → Cadastrar cão → Feed (swipe)
- **Walker:** Feed (ver cães) → Chat
- **Petshop:** Dashboard (adicionar produtos)
- **Grooming:** Dashboard (serviços)
- **Boarding:** Dashboard (quartos/vagas)
