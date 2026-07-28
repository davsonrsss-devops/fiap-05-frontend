const API_BASE_URL = 'http://ab50de13ee42b479292afe9129aafad1-88677664.us-east-1.elb.amazonaws.com';

document.addEventListener('DOMContentLoaded', () => {
    loadNGOs();
    loadDonations();
    loadVolunteersCount();
    
    document.getElementById('volunteer-form').addEventListener('submit', registerVolunteer);
    document.getElementById('ngo-form').addEventListener('submit', registerNGO);
    document.getElementById('donation-form').addEventListener('submit', registerDonation);
});

async function loadNGOs() {
    const loader = document.getElementById('loader-ngos');
    const list = document.getElementById('ngos-list');
    const selectVol = document.getElementById('v-ngo');
    const selectDon = document.getElementById('d-ngo');
    
    loader.style.display = 'block';
    
    try {
        const res = await fetch(`${API_BASE_URL}/ngos`);
        const ngos = await res.json();
        
        list.innerHTML = '';
        selectVol.innerHTML = '<option value="" disabled selected>Selecione uma ONG</option>';
        selectDon.innerHTML = '<option value="" disabled selected>Selecione a ONG de destino</option>';
        
        if (!ngos || ngos.length === 0) {
            list.innerHTML = '<p>Nenhuma ONG encontrada.</p>';
        } else {
            ngos.forEach(ngo => {
                // Populate List
                const div = document.createElement('div');
                div.className = 'card-item';
                div.innerHTML = `<h3>${ngo.name}</h3><p>${ngo.cause} - ${ngo.city}</p>`;
                list.appendChild(div);
                
                // Populate Selects
                const optVol = document.createElement('option');
                optVol.value = ngo.id;
                optVol.textContent = ngo.name;
                selectVol.appendChild(optVol);
                
                const optDon = document.createElement('option');
                optDon.value = ngo.id;
                optDon.textContent = ngo.name;
                selectDon.appendChild(optDon);
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
        if (!donations || donations.length === 0) {
            list.innerHTML = '<p>Nenhuma doação recente encontrada.</p>';
        } else {
            donations.forEach(donation => {
                const div = document.createElement('div');
                div.className = 'card-item';
                div.innerHTML = `<h3>R$ ${donation.amount.toFixed(2)}</h3><p>Doador: ${donation.donor_name} | ONG ID: ${donation.ngo_id}</p>`;
                list.appendChild(div);
            });
        }
    } catch (err) {
        list.innerHTML = '<p style="color:var(--error)">Erro ao carregar Doações.</p>';
    } finally {
        loader.style.display = 'none';
    }
}

async function loadVolunteersCount() {
    const countEl = document.getElementById('count-volunteers');
    try {
        const res = await fetch(`${API_BASE_URL}/volunteers`);
        if (res.ok) {
            const volunteers = await res.json();
            countEl.textContent = volunteers.length;
        } else {
            countEl.textContent = 'Erro';
        }
    } catch (err) {
        countEl.textContent = 'Indisponível';
    }
}

async function registerNGO(e) {
    e.preventDefault();
    const name = document.getElementById('n-name').value;
    const email = document.getElementById('n-email').value;
    const cause = document.getElementById('n-cause').value;
    const city = document.getElementById('n-city').value;
    
    const btnText = document.querySelector('.btn-text-ngo');
    const spinner = document.querySelector('.spinner-ngo');
    const msg = document.getElementById('ngo-form-msg');
    
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    msg.className = 'msg-hidden';
    
    try {
        const res = await fetch(`${API_BASE_URL}/ngos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, cause, city })
        });
        
        if (res.ok) {
            msg.textContent = 'ONG cadastrada com sucesso!';
            msg.className = 'msg-success';
            document.getElementById('ngo-form').reset();
            loadNGOs();
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

async function registerDonation(e) {
    e.preventDefault();
    const donor_name = document.getElementById('d-name').value;
    const amount = parseFloat(document.getElementById('d-amount').value);
    const ngo_id = parseInt(document.getElementById('d-ngo').value);
    
    const btnText = document.querySelector('.btn-text-donation');
    const spinner = document.querySelector('.spinner-donation');
    const msg = document.getElementById('donation-form-msg');
    
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    msg.className = 'msg-hidden';
    
    try {
        const res = await fetch(`${API_BASE_URL}/donations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ donor_name, amount, ngo_id })
        });
        
        if (res.ok) {
            msg.textContent = 'Doação realizada com sucesso!';
            msg.className = 'msg-success';
            document.getElementById('donation-form').reset();
            loadDonations();
            if(window.confetti) confetti();
        } else {
            const data = await res.json();
            msg.textContent = data.error || 'Erro ao processar doação';
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

async function registerVolunteer(e) {
    e.preventDefault();
    const name = document.getElementById('v-name').value;
    const email = document.getElementById('v-email').value;
    const ngo_id = parseInt(document.getElementById('v-ngo').value);
    
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');
    const msg = document.getElementById('form-msg');
    
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    msg.className = 'msg-hidden';
    
    try {
        const res = await fetch(`${API_BASE_URL}/volunteers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, ngo_id })
        });
        
        if (res.ok) {
            msg.textContent = 'Voluntário cadastrado com sucesso!';
            msg.className = 'msg-success';
            document.getElementById('volunteer-form').reset();
            loadVolunteersCount();
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
