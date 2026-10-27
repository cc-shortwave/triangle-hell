import pygame
import numpy as np

pygame.init()

SCREEN_WIDTH, SCREEN_HEIGHT = 1200, 800
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
blend_layer = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
temp_layer = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)

ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT
FIELD_OF_VIEW = 90
SCALE = SCREEN_HEIGHT / (2 * np.tan(np.radians(FIELD_OF_VIEW / 2)))


def create_rotation_x(angle):
    cosine = np.cos(float(angle))
    sine = np.sin(float(angle))
    return np.array([
        [1, 0, 0],
        [0, cosine, -sine],
        [0, sine, cosine]
    ], dtype=np.float32)


def create_rotation_y(angle):
    cosine = np.cos(float(angle))
    sine = np.sin(float(angle))
    return np.array([
        [cosine, 0, sine],
        [0, 1, 0],
        [-sine, 0, cosine]
    ], dtype=np.float32)


def create_rotation_z(angle):
    cosine = np.cos(float(angle))
    sine = np.sin(float(angle))
    return np.array([
        [cosine, -sine, 0],
        [sine, cosine, 0],
        [0, 0, 1]
    ], dtype=np.float32)


class Camera:
    def __init__(self):
        self.position = np.array([494.0, 364.0, -494.0], dtype=np.float32)
        self.rotation_matrix = np.eye(3, dtype=np.float32)
        self.euler_angles = np.array([0.42, -0.78, 0.0], dtype=np.float32)
        self.forward = np.array([0.0, 0.0, 1.0], dtype=np.float32)
        self.right = np.array([1.0, 0.0, 0.0], dtype=np.float32)
        self.up = np.array([0.0, 1.0, 0.0], dtype=np.float32)
        # world up vector (constant)
        self.world_up = np.array([0.0, 1.0, 0.0], dtype=np.float32)

    def update(self, phi, theta, x_movement, y_movement, z_movement, gamemode):
        # update rotation angles
        self.euler_angles[1] += phi  # yaw
        self.euler_angles[0] += theta  # pitch
        # clamp pitch to avoid flipping at the poles
        self.euler_angles[0] = np.clip(self.euler_angles[0], -np.pi/2 + 0.01, np.pi/2 - 0.01)

        # rebuild the rotation matrix
        rotation_x = create_rotation_x(self.euler_angles[0])
        rotation_y = create_rotation_y(self.euler_angles[1])
        rotation_z = create_rotation_z(self.euler_angles[2])
        self.rotation_matrix = np.dot(rotation_y, np.dot(rotation_x, rotation_z))

        # update direction vectors
        if gamemode:
            # game mode: keep forward horizontal (drop Y)
            horizontal_forward = np.array([
                self.rotation_matrix[0, 2],
                0.0,  # drop Y to stay horizontal
                self.rotation_matrix[2, 2]
            ], dtype=np.float32)
            norm = np.linalg.norm(horizontal_forward)
            self.forward = horizontal_forward / norm if norm > 0 else horizontal_forward
            
            # game mode: keep right horizontal too
            horizontal_right = np.array([
                self.rotation_matrix[0, 0],
                0.0,  # drop Y to stay horizontal
                self.rotation_matrix[2, 0]
            ], dtype=np.float32)
            norm = np.linalg.norm(horizontal_right)
            self.right = horizontal_right / norm if norm > 0 else horizontal_right
        else:
            # free mode: directions follow the rotation
            self.forward = np.dot(self.rotation_matrix, np.array([0.0, 0.0, 1.0]))
            self.right = np.dot(self.rotation_matrix, np.array([1.0, 0.0, 0.0]))

        # update up vector (from rotation; used for rendering)
        self.up = np.dot(self.rotation_matrix, np.array([0.0, 1.0, 0.0]))

        # update position
        if gamemode:
            # game mode: move along world Y, ignore rotation
            self.position += (x_movement * self.right + 
                             y_movement * self.world_up +  # use world up, not local up
                             z_movement * self.forward)
        else:
            # free mode: move along local up
            self.position += (x_movement * self.right + 
                             y_movement * self.up + 
                             z_movement * self.forward)


class Triangle:
    def __init__(self, point1, point2, point3, color):
        self.points = [
            np.array(point1, dtype=np.float32),
            np.array(point2, dtype=np.float32),
            np.array(point3, dtype=np.float32)
        ]
        self.color = color
        self.center_z = (point1[2] + point2[2] + point3[2]) / 3
        self.transformed_points = []

    def transform(self, camera):
        self.transformed_points = []
        for point in self.points:
            translated_point = point - camera.position
            rotated_point = np.dot(camera.rotation_matrix.T, translated_point)
            self.transformed_points.append(rotated_point)
        self.center_z = (self.transformed_points[0][2] + self.transformed_points[1][2] + self.transformed_points[2][2]) / 3

    def project(self):
        projected_points = []
        for point in self.transformed_points:
            if point[2] < 0.1 or point[2] >= 15000:
                continue
            scale = SCALE / point[2]
            x = point[0] * scale + SCREEN_WIDTH // 2
            y = SCREEN_HEIGHT // 2 - point[1] * scale
            if np.isfinite(x) and np.isfinite(y):
                projected_points.append((float(x), float(y)))
        return projected_points

    def draw(self, surface):
        points_2d = self.project()
        if len(points_2d) == 3:
            try:
                pygame.draw.polygon(surface, self.color, points_2d)
            except Exception:
                pass

    def is_visible(self):
        fov_half = np.radians(FIELD_OF_VIEW) / 2.0
        tan_fov_half = np.tan(fov_half) 
        tan_fov_half_horizontal = tan_fov_half  

        for point in self.transformed_points:
            z = point[2]
            if z <= 0.1 or z >= 15000:
                continue
            x_normalized = abs(point[0] / z)
            if x_normalized > tan_fov_half_horizontal:
                continue
            y_normalized = abs(point[1] / z)
            if y_normalized > tan_fov_half:
                continue
            return True
        return False


class Cube:
    def __init__(self, position_x, position_y, position_z, size_x, size_y, size_z, rotation_x, rotation_y, rotation_z, resolution=(1, 1)):
        self.position = np.array([position_x, position_y, position_z], dtype=np.float32)
        self.size = np.array([size_x, size_y, size_z], dtype=np.float32)
        self.rotation_angles = np.array([rotation_x, rotation_y, rotation_z], dtype=np.float32)
        self.resolution = resolution 
        self.triangles = self.create_triangles()

    def create_triangles(self):
        hx, hy, hz = self.size[0]/2, self.size[1]/2, self.size[2]/2
        rotation_x, rotation_y, rotation_z = self.rotation_angles
        rotation_matrix_x = create_rotation_x(rotation_x)
        rotation_matrix_y = create_rotation_y(rotation_y)
        rotation_matrix_z = create_rotation_z(rotation_z)
        rotation_matrix = np.dot(rotation_matrix_z, np.dot(rotation_matrix_y, rotation_matrix_x))

        faces = [
            (2, -hz, 0, (-hx, hx), 1, (-hy, hy), (160, 82, 45, 128)),
            (2, hz, 0, (-hx, hx), 1, (-hy, hy), (160, 82, 45, 128)),
            (0, -hx, 1, (-hy, hy), 2, (-hz, hz), (160, 82, 45, 128)),
            (0, hx, 1, (-hy, hy), 2, (-hz, hz), (160, 82, 45, 128)),
            (1, hy, 0, (-hx, hx), 2, (-hz, hz), (0, 255, 0, 128)),
            (1, -hy, 0, (-hx, hx), 2, (-hz, hz), (160, 82, 45, 128)),
        ]

        triangles = []
        n, m = self.resolution
        for face in faces:
            fixed_axis, fixed_val, axis1, axis1_range, axis2, axis2_range, color = face
            axis1_steps = np.linspace(axis1_range[0], axis1_range[1], m + 1, dtype=np.float32)
            axis2_steps = np.linspace(axis2_range[0], axis2_range[1], n + 1, dtype=np.float32)

            for i in range(m):
                for j in range(n):
                    a1 = axis1_steps[i]
                    a1_next = axis1_steps[i + 1]
                    a2 = axis2_steps[j]
                    a2_next = axis2_steps[j + 1]

                    def get_local_coord(a1_val, a2_val):
                        coord = np.zeros(3, dtype=np.float32)
                        coord[fixed_axis] = fixed_val
                        coord[axis1] = a1_val
                        coord[axis2] = a2_val
                        return coord

                    p1_local = get_local_coord(a1, a2)
                    p2_local = get_local_coord(a1_next, a2)
                    p3_local = get_local_coord(a1_next, a2_next)
                    p4_local = get_local_coord(a1, a2_next)

                    def transform_point(local_pt):
                        rotated = np.dot(rotation_matrix, local_pt)
                        translated = rotated + self.position
                        return translated

                    p1 = transform_point(p1_local)
                    p2 = transform_point(p2_local)
                    p3 = transform_point(p3_local)
                    p4 = transform_point(p4_local)
                    triangles.append(Triangle(p1, p2, p3, color))
                    triangles.append(Triangle(p1, p3, p4, color))

        return triangles

    def update_rotation(self, delta_x, delta_y, delta_z):
        self.rotation_angles += np.array([delta_x, delta_y, delta_z], dtype=np.float32)
        self.triangles = self.create_triangles()


if __name__ == "__main__":
    pygame.key.stop_text_input()
    try:
        font = pygame.font.SysFont(["SimHei", "WenQuanYi Micro Hei", "Heiti TC"], 24)
    except:
        font = pygame.font.Font(None, 24)
        
    running = True
    gamemode = False
    clock = pygame.time.Clock()
    camera = Camera()
    # add a rotated cube so the effect is visible
    cubes = [
        Cube(+150.0, +150.0, +150.0, 300, 300, 300, 0, 0, 0, resolution=(2, 2)),
        Cube(+150.0, +150.0, -150.0, 300, 300, 300, 0, 0, 0, resolution=(2, 2)),
        Cube(-150.0, +150.0, +150.0, 300, 300, 300, 0, 0, 0, resolution=(2, 2)),
        Cube(-150.0, +150.0, -150.0, 300, 300, 300, 0, 0, 0, resolution=(2, 2)),
    ]
    # auto-rotate the cubes for inspection
    auto_rotate = True
    
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_g:
                    gamemode = not gamemode
                elif event.key == pygame.K_r:
                    auto_rotate = not auto_rotate
        
        # handle input
        keys = pygame.key.get_pressed()
        camera_inputs = [0, 0, 0, 0, 0]  # [phi, theta, x_movement, y_movement, z_movement]
        if keys[pygame.K_w]:
            camera_inputs[4] += 10
        elif keys[pygame.K_s]:
            camera_inputs[4] -= 10
        if keys[pygame.K_a]:
            camera_inputs[2] -= 10
        elif keys[pygame.K_d]:
            camera_inputs[2] += 10
        if keys[pygame.K_LSHIFT]:
            camera_inputs[3] -= 10
        if keys[pygame.K_SPACE]:
            camera_inputs[3] += 10
        if keys[pygame.K_LEFT]:
            camera_inputs[0] -= 0.05
        elif keys[pygame.K_RIGHT]:
            camera_inputs[0] += 0.05
        if keys[pygame.K_UP]:
            camera_inputs[1] -= 0.05
        elif keys[pygame.K_DOWN]:
            camera_inputs[1] += 0.05
            
        # update camera
        camera.update(*camera_inputs, gamemode)
        
        # render
        all_triangles = []
        for cube in cubes:
            for tri in cube.triangles:
                tri.transform(camera) 
                if tri.is_visible(): 
                    all_triangles.append(tri)
        
        # clear screen
        screen.fill((0, 0, 0))
        blend_layer.fill((0, 0, 0, 0))
        
        # sort by depth, draw back to front
        sorted_tris = sorted(all_triangles, key=lambda t: t.center_z, reverse=True)
        for tri in sorted_tris:
            temp_layer.fill((0, 0, 0, 0))
            tri.draw(temp_layer)
            blend_layer.blit(temp_layer, (0, 0), special_flags=pygame.BLEND_ALPHA_SDL2)
        
        screen.blit(blend_layer, (0, 0))
        
        # HUD
        fps_text = font.render(f"FPS: {int(clock.get_fps())}", True, (255, 255, 255))
        screen.blit(fps_text, (10, 10))
        
        pos_text = font.render(
            f"Position: X={camera.position[0]:.1f}, Y={camera.position[1]:.1f}, Z={camera.position[2]:.1f}",
            True, (255, 255, 255)
        )
        screen.blit(pos_text, (10, 40))
        
        euler_deg = np.degrees(camera.euler_angles)
        euler_text = font.render(
            f"Rotation: X={euler_deg[0]:.1f}, Y={euler_deg[1]:.1f}, Z={euler_deg[2]:.1f}",
            True, (255, 255, 255)
        )
        screen.blit(euler_text, (10, 70))
        
        mode_text = font.render(f"Mode: {'Game' if gamemode else 'Free'}", True, (255, 255, 255))
        screen.blit(mode_text, (10, 100))
        
        pygame.display.flip()
        clock.tick(120)
    
    pygame.quit()