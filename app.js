const API_BASE_URL = 'http://a41e7a32cf6d648fa883b64b27535598-1215733135.us-east-1.elb.amazonaws.com';

document.addEventListener('DOMContentLoaded', () => {
    loadNGOs();
    loadDonations();
    
    document.getElementById('volunteer-form').addEventListener('submit', registerVolunteer);
});

async function loadNGOs() {
    const loader = document.getElementById('loader-ngos');
    const list = document.getElementById('ngos-list');
    const select = document.getElementById('v-ngo');
    
    loader.style.display = 'block';
    
    try {
        const res = await fetch(`${API_BASE_URL}/ngos`);
        const ngos = await res.json();
        
        list.innerHTML = '';
        if (ngos.length === 0) {
            list.innerHTML = '<p>Nenhuma ONG encontrada.</p>';
        } else {
            ngos.forEach(ngo => {
                // Populate List
                const div = document.createElement('div');
                div.className = 'card-item';
                div.innerHTML = `<h3>${ngo.name}</h3><p>${ngo.cause} - ${ngo.city}</p>`;
                list.appendChild(div);
                
                // Populate Select Option
                const option = document.createElement('option');
                option.value = ngo.id;
                option.textContent = ngo.name;
                select.appendChild(option);
            });
        }
    } catch (err) {
        list.innerHTML = '<p style="color:var(--error)">Erro ao carregar ONGs.</p>';
    } finally {
        loader.style.display = 'none';
    }
}

async function loadDonations() {
    const loader = document.getElementById('loader-donations');
    const list = document.getElementById('donations-list');
    
    loader.style.display = 'block';
    
    try {
        const res = await fetch(`${API_BASE_URL}/donations`);
        const donations = await res.json();
        
        list.innerHTML = '';
        if (donations.length === 0) {
            list.innerHTML = '<p>Nenhuma doação recente encontrada.</p>';
        } else {
            donations.forEach(donation => {
                const div = document.createElement('div');
                div.className = 'card-item';
                div.innerHTML = `<h3>R$ ${donation.amount.toFixed(2)}</h3><p>Para ONG ID: ${donation.ngo_id}</p>`;
                list.appendChild(div);
            });
        }
    } catch (err) {
        list.innerHTML = '<p style="color:var(--error)">Erro ao carregar Doações.</p>';
    } finally {
        loader.style.display = 'none';
    }
}

async function registerVolunteer(e) {
    e.preventDefault();
    
    const name = document.getElementById('v-name').value;
    const email = document.getElementById('v-email').value;
    const ngo_id = document.getElementById('v-ngo').value;
    
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');
    const msg = document.getElementById('form-msg');
    
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    msg.className = 'msg-hidden';
    
    try {
        const res = await fetch(`${API_BASE_URL}/volunteers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, ngo_id })
        });
        
        if (res.ok) {
            msg.textContent = 'Voluntário cadastrado com sucesso!';
            msg.className = 'msg-success';
            document.getElementById('volunteer-form').reset();
            
            // Fire Confetti!
            if(window.confetti) confetti();
        } else {
            const data = await res.json();
            msg.textContent = data.error || 'Erro ao cadastrar';
            msg.className = 'msg-error';
        }
    } catch (err) {
        msg.textContent = 'Erro de conexão com o servidor.';
        msg.className = 'msg-error';
    } finally {
        btnText.style.display = 'block';
        spinner.style.display = 'none';
    }
}
