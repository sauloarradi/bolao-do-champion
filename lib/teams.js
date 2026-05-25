export const TEAMS = [
  {id:'bra',name:'Brasil',flag:'🇧🇷'},{id:'arg',name:'Argentina',flag:'🇦🇷'},
  {id:'fra',name:'França',flag:'🇫🇷'},{id:'esp',name:'Espanha',flag:'🇪🇸'},
  {id:'eng',name:'Inglaterra',flag:'🏴'},{id:'ger',name:'Alemanha',flag:'🇩🇪'},
  {id:'por',name:'Portugal',flag:'🇵🇹'},{id:'ned',name:'Holanda',flag:'🇳🇱'},
  {id:'uru',name:'Uruguai',flag:'🇺🇾'},{id:'bel',name:'Bélgica',flag:'🇧🇪'},
  {id:'usa',name:'Estados Unidos',flag:'🇺🇸'},{id:'mex',name:'México',flag:'🇲🇽'},
  {id:'col',name:'Colômbia',flag:'🇨🇴'},{id:'mar',name:'Marrocos',flag:'🇲🇦'},
  {id:'jpn',name:'Japão',flag:'🇯🇵'},{id:'sen',name:'Senegal',flag:'🇸🇳'},
  {id:'den',name:'Dinamarca',flag:'🇩🇰'},{id:'cro',name:'Croácia',flag:'🇭🇷'},
  {id:'sui',name:'Suíça',flag:'🇨🇭'},{id:'aus',name:'Austrália',flag:'🇦🇺'},
  {id:'ecu',name:'Equador',flag:'🇪🇨'},{id:'kor',name:'Coreia do Sul',flag:'🇰🇷'},
  {id:'cam',name:'Camarões',flag:'🇨🇲'},{id:'irn',name:'Irã',flag:'🇮🇷'}
];

export const TEAM_IDS = TEAMS.map(t => t.id);

export function teamName(id) {
  return TEAMS.find(t => t.id === id)?.name || id;
}
