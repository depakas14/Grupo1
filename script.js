// Seleciona elementos do DOM
const entradaCidade = document.querySelector(".city-input");
const botaoBuscar = document.querySelector(".search-btn");
const botaoLocalizacao = document.querySelector(".location-btn");
const divClimaAtual = document.querySelector(".current-weather");
const divCartoesClima = document.querySelector(".weather-cards");

// Chave para a API do OpenWeatherMap
const CHAVE_API = "00e60f9c208429716c46892a6759447e";

// Função para criar cartões de clima
const criarCartaoClima = (nomeCidade, itemClima, indice) => {
    const tempCelsius = (itemClima.main.temp - 273.15).toFixed(2); // Converte para Celsius
    const velocidadeVento = itemClima.wind.speed; // Velocidade do vento em m/s
    const umidade = itemClima.main.humidity; // Umidade em %
    const data = itemClima.dt_txt.split(" ")[0]; // Data da previsão
    const iconeClima = itemClima.weather[0].icon; // Ícone do clima
    const descricaoClima = itemClima.weather[0].description; // Descrição do clima

    if (indice === 0) { // Cartão principal do clima atual
        return `<div class="details">
                    <h2>${nomeCidade} (${data})</h2>
                    <h6>Temperatura: ${tempCelsius}°C</h6>
                    <h6>Vento: ${velocidadeVento} M/S</h6>
                    <h6>Umidade: ${umidade}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${iconeClima}@4x.png" alt="ícone-clima">
                    <h6>${descricaoClima}</h6>
                </div>`;
    } else { // Cartões para a previsão dos cinco dias
        return `<li class="card">
                    <h3>(${data})</h3>
                    <img src="https://openweathermap.org/img/wn/${iconeClima}@4x.png" alt="ícone-clima">
                    <h6>Temp: ${tempCelsius}°C</h6>
                    <h6>Vento: ${velocidadeVento} M/S</h6>
                    <h6>Umidade: ${umidade}%</h6>
                </li>`;
    }
};

// Função para verificar condições climáticas severas
const verificarCondicoesSeveras = (itemClima) => {
    const descricaoClima = itemClima.weather[0].description.toLowerCase(); 
    const condicoesSeveras = ["heavy rain", "heavy snow", "thunderstorm", "storm"];
    return condicoesSeveras.some(condicao => descricaoClima.includes(condicao));
};

// Função para obter detalhes do clima
const obterDetalhesClima = (nomeCidade, latitude, longitude) => {
    const URL_API_CLIMA = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${CHAVE_API}`;

    fetch(URL_API_CLIMA)
        .then(response => response.json())
        .then(data => {
            const diasPrevisaoUnicos = [];
            const previsaoCincoDias = data.list.filter(previsao => {
                const dataPrevisao = new Date(previsao.dt_txt).getDate();
                if (!diasPrevisaoUnicos.includes(dataPrevisao)) {
                    return diasPrevisaoUnicos.push(dataPrevisao);
                }
            });

            // Verifica se há condições climáticas severas
            const temCondicoesSeveras = previsaoCincoDias.some(verificarCondicoesSeveras);
            if (temCondicoesSeveras) {
                alert("Atenção: Previsão de condições climáticas severas. Tome precauções.");
            }

            // Limpa dados antigos
            entradaCidade.value = "";
            divClimaAtual.innerHTML = "";
            divCartoesClima.innerHTML = "";

            // Adiciona cartões de clima ao DOM
            previsaoCincoDias.forEach((itemClima, indice) => {
                const html = criarCartaoClima(nomeCidade, itemClima, indice);
                if (indice === 0) {
                    divClimaAtual.insertAdjacentHTML("beforeend", html);
                } else {
                    divCartoesClima.insertAdjacentHTML("beforeend", html);
                }
            });
        })
        .catch(() => {
            alert("Ocorreu um erro ao buscar a previsão do tempo!");
        });
};

// Função para obter coordenadas da cidade
const obterCoordenadasCidade = () => {
    const nomeCidade = entradaCidade.value.trim();
    if (nomeCidade === "") return;
    const URL_API = `https://api.openweathermap.org/geo/1.0/direct?q=${nomeCidade}&limit=1&appid=${CHAVE_API}`;

    fetch(URL_API)
        .then(response => response.json())
        .then(data => {
            if (!data.length) {
                return alert(`Nenhuma coordenada encontrada para ${nomeCidade}`);
            }
            const { lat, lon, name } = data[0];
            obterDetalhesClima(name, lat, lon);
        })
        .catch(() => {
            alert("Ocorreu um erro ao buscar as coordenadas!");
        });
};

// Função para obter coordenadas do usuário
const obterCoordenadasUsuario = () => {
    navigator.geolocation.getCurrentPosition(
        (posicao) => {
            const { latitude, longitude } = posicao.coords; // Coordenadas do usuário
            const URL_API = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${CHAVE_API}`;
            fetch(URL_API)
                .then(response => response.json())
                .then(data => {
                    const { name } = data[0];
                    obterDetalhesClima(name, latitude, longitude);
                })
                .catch(() => {
                    alert("Ocorreu um erro ao buscar o nome da cidade!");
                });
        },
        (erro) => {
            if (erro.PERMISSION_DENIED) {
                alert("Permissão de localização negada. Redefina para conceder acesso.");
            } else {
                alert("Erro na solicitação de geolocalização.");
            }
        }
    );
};

// Adiciona eventos aos botões
botaoBuscar.addEventListener("click", obterCoordenadasCidade);
botaoLocalizacao.addEventListener("click", obterCoordenadasUsuario);
entradaCidade.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        obterCoordenadasCidade();
    }
});
