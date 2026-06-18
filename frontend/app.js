document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('user-form');
    const messageDiv = document.getElementById('form-message');
    const tbody = document.getElementById('users-tbody');

    // The API is available at /api via the reverse proxy
    const API_URL = '/api/users';

    // Fetch and display users on load
    fetchUsers();

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Usuário cadastrado com sucesso!', 'success');
                form.reset();
                fetchUsers(); // Refresh the list
            } else {
                showMessage(data.error || 'Erro ao cadastrar usuário.', 'error');
            }
        } catch (error) {
            showMessage('Erro de conexão com a API.', 'error');
            console.error('Error:', error);
        }
    });

    // Function to fetch users from API
    async function fetchUsers() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Falha ao buscar usuários');
            
            const users = await response.json();
            renderUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            tbody.innerHTML = `<tr><td colspan="4" class="empty-state" style="color: red;">Erro ao carregar usuários. Verifique se a API está online.</td></tr>`;
        }
    }

    // Function to render users in the table
    function renderUsers(users) {
        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Nenhum usuário cadastrado ainda.</td></tr>`;
            return;
        }

        tbody.innerHTML = users.map(user => {
            const date = new Date(user.created_at).toLocaleString('pt-BR');
            return `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${date}</td>
                </tr>
            `;
        }).join('');
    }

    // Function to display messages
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        
        // Hide message after 5 seconds
        setTimeout(() => {
            messageDiv.className = 'message';
            messageDiv.style.display = 'none';
        }, 5000);
        messageDiv.style.display = 'block';
    }
});
