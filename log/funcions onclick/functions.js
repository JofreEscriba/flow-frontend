// Función para manejar el evento onclick del botón de Sign In
async function signIn() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
         const response = await fetch('/log/server.js/signin', {
             method: 'POST',
            headers: {
                 'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
             const data = await response.json();
            console.log('Sign In exitoso:', data);
            // Redirigir o realizar alguna acción
            history.push('/dashboard')
        } else {
             console.error('Error en Sign In:', response.statusText);
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
    }
}

// Función para manejar el evento onclick del botón de Sign Up
async function signUp() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/log/server.js/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Sign Up exitoso:', data);
            // Redirigir o realizar alguna acción
            history.push('/dashboard')
        } else {
            console.error('Error en Sign Up:', response.statusText);
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
    }
}

// Exportar las funciones si es necesario
export { signIn, signUp };