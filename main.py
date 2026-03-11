"""
NexoCorp – Automação de Cadastro via CSV
=========================================
Lê os arquivos CSV (colaboradores.csv ou produtos.csv) e preenche
automaticamente o formulário web usando Selenium.

Requisitos:
  pip install selenium pandas webdriver-manager

Uso:
  python main.py colaboradores   → cadastra colaboradores
  python main.py produtos        → cadastra produtos
"""

import sys
import time
import os
import pandas as pd

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# ─────────────────────────────────────────────
# CONFIGURAÇÃO
# ─────────────────────────────────────────────

# Caminho absoluto para o index.html (ajuste se necessário)
BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
URL_FORM  = f"file:///{BASE_DIR}/index.html".replace("\\", "/")

DELAY_CAMPO  = 0.05   # segundos entre cada caractere (digitação)
DELAY_FORM   = 1.5    # segundos entre cada cadastro


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def digitar(driver, locator, valor, by=By.ID):
    """Limpa e digita texto em um campo."""
    if pd.isna(valor) or str(valor).strip() == "":
        return
    el = WebDriverWait(driver, 10).until(EC.presence_of_element_located((by, locator)))
    el.clear()
    el.send_keys(str(valor))

def selecionar(driver, locator, valor, by=By.ID):
    """Seleciona uma opção em um <select>."""
    if pd.isna(valor) or str(valor).strip() == "":
        return
    el = WebDriverWait(driver, 10).until(EC.presence_of_element_located((by, locator)))
    Select(el).select_by_visible_text(str(valor))

def clicar(driver, locator, by=By.ID):
    el = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((by, locator)))
    el.click()

def aguardar_toast(driver):
    """Aguarda o toast de confirmação aparecer."""
    time.sleep(DELAY_FORM)


# ─────────────────────────────────────────────
# CADASTRO DE COLABORADORES
# ─────────────────────────────────────────────

def cadastrar_colaboradores(driver, df):
    print(f"\n📋 Iniciando cadastro de {len(df)} colaboradores...\n")

    for i, row in df.iterrows():
        print(f"  → [{i+1}/{len(df)}] {row.get('nome', '—')}")

        # Navegar para aba Colaboradores (se não estiver nela)
        nav = driver.find_element(By.CSS_SELECTOR, '[data-section="pessoas"]')
        nav.click()
        time.sleep(0.3)

        # Preencher campos
        digitar(driver, "p-nome",     row.get("nome"))
        digitar(driver, "p-cpf",      row.get("cpf"))
        digitar(driver, "p-data-nasc",row.get("data_nasc"))
        digitar(driver, "p-email",    row.get("email"))
        digitar(driver, "p-telefone", row.get("telefone"))

        selecionar(driver, "p-cargo",        row.get("cargo"))
        selecionar(driver, "p-departamento", row.get("departamento"))

        digitar(driver, "p-salario",  row.get("salario"))
        digitar(driver, "p-admissao", row.get("admissao"))
        digitar(driver, "p-endereco", row.get("endereco"))

        # Submeter formulário
        btn = driver.find_element(By.CSS_SELECTOR, "#form-pessoas button[type='submit']")
        btn.click()
        aguardar_toast(driver)

    print("\n✅ Todos os colaboradores foram cadastrados!")


# ─────────────────────────────────────────────
# CADASTRO DE PRODUTOS
# ─────────────────────────────────────────────

def cadastrar_produtos(driver, df):
    print(f"\n📦 Iniciando cadastro de {len(df)} produtos...\n")

    for i, row in df.iterrows():
        print(f"  → [{i+1}/{len(df)}] {row.get('nome', '—')}")

        # Navegar para aba Produtos
        nav = driver.find_element(By.CSS_SELECTOR, '[data-section="produtos"]')
        nav.click()
        time.sleep(0.3)

        # Preencher campos
        digitar(driver, "pr-nome",     row.get("nome"))
        digitar(driver, "pr-codigo",   row.get("codigo"))
        selecionar(driver, "pr-categoria", row.get("categoria"))
        digitar(driver, "pr-preco",    row.get("preco"))
        digitar(driver, "pr-custo",    row.get("custo"))
        digitar(driver, "pr-estoque",  row.get("estoque"))
        digitar(driver, "pr-min-estoque", row.get("min_estoque"))
        digitar(driver, "pr-fornecedor",  row.get("fornecedor"))

        # Unidade de medida
        unidade = row.get("unidade", "un")
        if not pd.isna(unidade):
            selecionar(driver, "pr-unidade", str(unidade))

        digitar(driver, "pr-descricao", row.get("descricao"))

        # Submeter
        btn = driver.find_element(By.CSS_SELECTOR, "#form-produtos button[type='submit']")
        btn.click()
        aguardar_toast(driver)

    print("\n✅ Todos os produtos foram cadastrados!")


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    # Determinar modo pelo argumento (padrão: colaboradores)
    modo = sys.argv[1].lower() if len(sys.argv) > 1 else "colaboradores"

    if modo not in ("colaboradores", "produtos"):
        print("Uso: python main.py colaboradores | produtos")
        sys.exit(1)

    # Carregar CSV
    csv_path = os.path.join(BASE_DIR, f"{modo}.csv")
    if not os.path.exists(csv_path):
        print(f"❌ Arquivo não encontrado: {csv_path}")
        sys.exit(1)

    df = pd.read_csv(csv_path)
    print(f"📂 CSV carregado: {csv_path}  ({len(df)} linhas)")

    # Iniciar Chrome
    print("🌐 Abrindo navegador...")
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    # options.add_argument("--headless")  # descomente para rodar sem janela

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    try:
        driver.get(URL_FORM)
        time.sleep(1.5)  # aguarda carregamento da página

        if modo == "colaboradores":
            cadastrar_colaboradores(driver, df)
        else:
            cadastrar_produtos(driver, df)

        # Ir para a tela de registros ao finalizar
        driver.find_element(By.CSS_SELECTOR, '[data-section="registros"]').click()
        print("\n🎉 Automação concluída! Registros disponíveis na aba 'Registros'.")
        time.sleep(5)  # exibe resultado antes de fechar

    except Exception as e:
        print(f"\n❌ Erro durante automação: {e}")
        raise

    finally:
        driver.quit()


if __name__ == "__main__":
    main()