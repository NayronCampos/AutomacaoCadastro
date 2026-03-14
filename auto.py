import pandas as pd
import pyautogui
from datetime import datetime


tabela = pd.read_csv("colaboradores.csv")


pyautogui.click(x=1116, y=484)

for linha in tabela.index:

        nome = tabela.loc[linha, "nome"]
        pyautogui.write(nome)

        pyautogui.press("tab")

        cpf = str(tabela.loc[linha, "cpf"])
        pyautogui.write(cpf)

        pyautogui.press("tab")

        data = tabela.loc[linha, "data_nasc"]


        ano, mes, dia = data.split("-")

        pyautogui.write(dia)
        pyautogui.sleep(1)
        pyautogui.write(mes)
        pyautogui.sleep(1)
        pyautogui.write(ano)

        pyautogui.click(x=654, y=686)
    

'''
        data_formatada = data.strftime("%d %m %Y")


        pyautogui.PAUSE = 5
'''
