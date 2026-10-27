import numpy as np
from matplotlib import pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

u = np.linspace(0, 1, 20)
v = np.linspace(0, 2*np.pi, 32)
u, v = np.meshgrid(u, v)

a, b, k = 1, 0.5, 0.3
r = a * (1 - u**2) * (1 + b*u)
x = r * np.cos(v) * (1 - k*u*np.sin(v/2))
z = r * np.sin(v) * (1 + k*u*np.cos(v))
y = u

fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
ax.plot_surface(x, y, z, cmap='viridis', alpha=0.8)
plt.show()