import socket
import webbrowser

ip = socket.gethostbyname(socket.gethostname())
print(ip)
webbrowser.oepn(str(ip + ':8000'), 1)