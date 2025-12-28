# ⚡ Guia Rápido: Executar SQL no Supabase

## 🎯 **Passo a Passo (5 minutos cada script):**

### **1. Abrir SQL Editor:**
1. Vá para: https://supabase.com/dashboard/project/uuxdpyllgqggqdgzhxzd
2. Clique em **SQL Editor** no menu lateral esquerdo
3. Clique em **"New Query"**

---

### **2. Script 1 - GPS Tracking:**

**Arquivo:** `supabase_gps_migration.sql`

**Copiar:**
- Abra o arquivo no VS Code (já está aberto)
- Pressione `Ctrl+A` (selecionar tudo)
- Pressione `Ctrl+C` (copiar)

**Colar e Executar:**
- No SQL Editor do Supabase, cole (`Ctrl+V`)
- Clique no botão verde **"Run"** (canto inferior direito)
- Aguarde a mensagem: ✅ **"Success. No rows returned"**

---

### **3. Script 2 - Wallet System:**

**Arquivo:** `supabase_wallet_migration.sql`

**Repetir o processo:**
1. Nova Query no Supabase
2. Abrir arquivo no VS Code
3. Ctrl+A → Ctrl+C
4. Colar no Supabase
5. Run ✅

---

### **4. Script 3 - Dados de Exemplo:**

**Arquivo:** `supabase_sample_data.sql`

**Repetir o processo:**
1. Nova Query
2. Ctrl+A → Ctrl+C do arquivo
3. Colar
4. Run ✅

**Resultado esperado:**
```
Sample data loaded successfully! 🎉
```

---

## ✅ **Verificar se funcionou:**

No SQL Editor, execute esta query:
```sql
SELECT COUNT(*) as total FROM products;
```

**Deve retornar:** `6` (6 produtos inseridos)

---

## 🚀 **Depois de executar os 3 scripts:**

1. Abra: http://localhost:3000
2. Recarregue a página (F5)
3. Teste:
   - **Marketplace** → Ver 6 produtos
   - **Mapa** → Ver 4 passeadores/serviços
   - **Wallet** → Ver saldo de €100
   - **Minhas Atividades** → Ver 1 booking de teste

---

## 🐛 **Se der erro:**

**Erro: "relation already exists"**
→ Tabela já foi criada antes. Pode ignorar ou deletar e recriar.

**Erro: "permission denied"**
→ Verifique se está logado no projeto correto.

**Erro: "syntax error"**
→ Certifique-se de copiar TODO o conteúdo do arquivo.

---

## 📞 **Precisa de ajuda?**

Copie a mensagem de erro e me mostre! 🚀
