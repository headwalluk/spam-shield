document.addEventListener('DOMContentLoaded', async () => {
  const userModal = document.getElementById('userModal');
  if (userModal) {
    const modalTitle = userModal.querySelector('.modal-title');
    const form = userModal.querySelector('#userForm');
    const emailInput = userModal.querySelector('#emailInput');
    const statusInput = userModal.querySelector('#statusInput');

    // Fetch user statuses and populate the dropdown
    try {
      const response = await fetch('/api/v3/user-statuses');
      if (response.ok) {
        const statuses = await response.json();
        statuses.forEach((status) => {
          const option = document.createElement('option');
          option.value = status.status_slug;
          option.textContent = status.description;
          statusInput.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error fetching user statuses:', error);
    }

    userModal.addEventListener('show.bs.modal', (event) => {
      const button = event.relatedTarget;
      const userId = button.getAttribute('data-user-id');
      const userEmail = button.getAttribute('data-user-email');

      if (userId) {
        // Editing an existing user
        modalTitle.textContent = 'Edit User';
        form.action = `/api/v3/admin/users/${userId}?_method=PUT`;
        emailInput.value = userEmail;
      } else {
        // Creating a new user
        modalTitle.textContent = 'Create User';
        form.action = '/api/v3/admin/users';
        emailInput.value = '';
      }
    });

    userModal.addEventListener('shown.bs.modal', () => {
      emailInput.focus();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const url = form.action;
      const method = url.includes('?_method=PUT') ? 'PUT' : 'POST';

      try {
        const response = await fetch(url.split('?')[0], {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          window.location.reload();
        } else {
          alert('Error saving user');
        }
      } catch (error) {
        alert('Error saving user');
      }
    });
  }

  document.querySelectorAll('[data-delete-user]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      if (confirm('Are you sure you want to delete this user?')) {
        const userId = button.getAttribute('data-user-id');
        try {
          const response = await fetch(`/api/v3/admin/users/${userId}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            window.location.reload();
          } else {
            alert('Error deleting user');
          }
        } catch (error) {
          alert('Error deleting user');
        }
      }
    });
  });
});
