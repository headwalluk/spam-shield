document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.assertBootstrapReady === 'function') {
    window.assertBootstrapReady('admin-users');
  }
  const usersTableBody = document.getElementById('usersTableBody');
  const paginationUl = document.getElementById('pagination');
  const searchForm = document.getElementById('searchForm');
  const emailSearchInput = document.getElementById('emailSearchInput');
  const userModalEl = document.getElementById('userModal');

  let userModal = null;
  if (userModalEl && window.bootstrap) {
    userModal = window.bootstrap.Modal.getOrCreateInstance(userModalEl);
  }

  const modalTitle = userModalEl.querySelector('.modal-title');
  const userForm = document.getElementById('userForm');
  const emailInput = document.getElementById('emailInput');
  const statusInput = document.getElementById('statusInput');
  const userIdInput = document.getElementById('userIdInput');
  const rolesCheckboxes = document.getElementById('rolesCheckboxes');
  const toastContainer = document.querySelector('.toast-container');
  const loadingSpinner = document.getElementById('loadingSpinner');

  let currentPage = 1;
  let currentSearchTerm = '';
  let allRoles = [];

  const showToast = (message, type = 'success') => {
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toastEl.role = 'alert';
    toastEl.ariaLive = 'assertive';
    toastEl.ariaAtomic = 'true';
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    toastContainer.appendChild(toastEl);
    if (window.bootstrap) {
      const toast = new window.bootstrap.Toast(toastEl, { autohide: true, delay: 5000 });
      toast.show();
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }
  };

  const showLoadingSpinner = () => {
    loadingSpinner.classList.remove('d-none', 'fade');
  };

  const hideLoadingSpinner = () => {
    loadingSpinner.classList.add('fade');
    setTimeout(() => {
      loadingSpinner.classList.add('d-none');
    }, 150); // Match Bootstrap's fade duration
  };

  const fetchUsers = async (page = 1, email = '') => {
    showLoadingSpinner();
    try {
      // Keep the table body empty while loading, but don't show a spinner in it
      if (usersTableBody.innerHTML.includes('text-muted')) {
        usersTableBody.innerHTML = '';
      }
      const params = new URLSearchParams({ page, limit: 10, email });
      const response = await fetch(`/api/v3/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      renderUsers(data.users);
      renderPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      usersTableBody.innerHTML = `<tr><td colspan="4" class="text-danger">Error loading users.</td></tr>`;
    } finally {
      hideLoadingSpinner();
    }
  };

  const renderUsers = (users) => {
    usersTableBody.innerHTML = '';
    if (!users || users.length === 0) {
      usersTableBody.innerHTML = `<tr><td colspan="4" class="text-muted">No users found.</td></tr>`;
      return;
    }
    users.forEach((user) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.email}</td>
        <td>${user.roles && user.roles.length > 0 ? user.roles.join(', ') : 'N/A'}</td>
        <td>${user.status}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#userModal" data-user-id="${user.id}" title="Edit user">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" data-delete-user data-user-id="${user.id}" title="Delete user">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      usersTableBody.appendChild(row);
    });
  };

  const renderPagination = (pagination) => {
    paginationUl.innerHTML = '';
    if (!pagination || pagination.totalPages <= 1) {
      return;
    }
    for (let i = 1; i <= pagination.totalPages; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === pagination.currentPage ? 'active' : ''}`;
      const a = document.createElement('a');
      a.className = 'page-link';
      a.href = '#';
      a.textContent = i;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = i;
        fetchUsers(currentPage, currentSearchTerm);
      });
      li.appendChild(a);
      paginationUl.appendChild(li);
    }
  };

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentSearchTerm = emailSearchInput.value.trim();
    currentPage = 1;
    fetchUsers(currentPage, currentSearchTerm);
  });

  const populateStatuses = async () => {
    try {
      const response = await fetch('/api/v3/admin/user-statuses');
      if (response.ok) {
        const statuses = await response.json();
        statusInput.innerHTML = ''; // Clear previous options
        statuses.forEach((status) => {
          const option = document.createElement('option');
          option.value = status.slug;
          option.textContent = status.title;
          statusInput.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error fetching user statuses:', error);
    }
  };

  const populateRoles = async () => {
    try {
      const response = await fetch('/api/v3/admin/roles');
      if (response.ok) {
        allRoles = await response.json();
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const renderRoles = (userRoles = []) => {
    rolesCheckboxes.innerHTML = '';
    allRoles.forEach((role) => {
      const isChecked = userRoles.includes(role.name);
      const isDisabled = role.name === 'user';
      const div = document.createElement('div');
      div.className = 'form-check';
      div.innerHTML = `
        <input class="form-check-input" type="checkbox" value="${role.id}" id="role-${role.id}" name="roles" ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
        <label class="form-check-label" for="role-${role.id}">${role.name}</label>
      `;
      rolesCheckboxes.appendChild(div);
    });
  };

  userModalEl.addEventListener('show.bs.modal', async (event) => {
    const button = event.relatedTarget;
    const userId = button.getAttribute('data-user-id');
    userForm.reset();
    rolesCheckboxes.innerHTML = 'Loading roles...';

    if (userId) {
      modalTitle.textContent = 'Edit User';
      userIdInput.value = userId;
      try {
        const response = await fetch(`/api/v3/admin/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        const user = await response.json();
        emailInput.value = user.email;
        statusInput.value = user.status_slug;
        renderRoles(user.roles);
      } catch (error) {
        console.error('Error fetching user details:', error);
        rolesCheckboxes.innerHTML = '<p class="text-danger">Could not load roles.</p>';
      }
    } else {
      modalTitle.textContent = 'Create User';
      userIdInput.value = '';
      renderRoles(['user']);
    }
  });

  userModalEl.addEventListener('shown.bs.modal', () => {
    emailInput.focus();
  });

  userForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = userIdInput.value;
    const url = id ? `/api/v3/admin/users/${id}` : '/api/v3/admin/users';
    const method = id ? 'PUT' : 'POST';

    const selectedRoles = Array.from(
      rolesCheckboxes.querySelectorAll('input[name="roles"]:checked')
    ).map((input) => parseInt(input.value, 10));
    const userRole = allRoles.find((r) => r.name === 'user');
    if (userRole && !selectedRoles.includes(userRole.id)) {
      selectedRoles.push(userRole.id);
    }

    const data = {
      email: emailInput.value,
      status: statusInput.value,
      roles: selectedRoles
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        // Wait for the modal to be fully hidden before showing the toast and refreshing the table
        // This prevents issues with the modal backdrop not being removed correctly.
        userModalEl.addEventListener(
          'hidden.bs.modal',
          () => {
            // Manually remove the backdrop in case it lingers
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }
            showToast('User saved successfully.');
            fetchUsers(currentPage, currentSearchTerm);
          },
          { once: true }
        );

        if (userModal) {
          userModal.hide();
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error saving user' }));
        showToast(errorData.message || 'Error saving user', 'danger');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showToast('An unexpected error occurred.', 'danger');
    }
  });

  document.body.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-user]');
    if (button) {
      if (confirm('Are you sure you want to delete this user?')) {
        const userId = button.getAttribute('data-user-id');
        try {
          const response = await fetch(`/api/v3/admin/users/${userId}`, { method: 'DELETE' });
          if (response.ok) {
            showToast('User deleted successfully.');
            fetchUsers(currentPage, currentSearchTerm);
          } else {
            showToast('Error deleting user.', 'danger');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          showToast('An unexpected error occurred.', 'danger');
        }
      }
    }
  });

  // Initial fetches
  populateStatuses();
  populateRoles().then(() => {
    fetchUsers(currentPage);
  });
});
