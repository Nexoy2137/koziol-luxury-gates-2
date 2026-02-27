/** Kolory RAL (code -> hex). */
export const RAL_HEX: Record<string, string> = {
  "1000": "#CDBA88", "1001": "#D0B084", "1002": "#D2AA6D", "1003": "#F9A800", "1004": "#E49E00",
  "1005": "#CB8E00", "1006": "#E29000", "1007": "#E88C00", "1011": "#AF804F", "1012": "#DDAF27",
  "1013": "#E3D9C6", "1014": "#DDC49A", "1015": "#E6D2B5", "1016": "#F1DD38", "1017": "#F6A950",
  "1018": "#FACA30", "1019": "#A48F7A", "1020": "#A08F65", "1021": "#F6B600", "1023": "#F7B500",
  "1024": "#BA8F4C", "1026": "#FFFF00", "1027": "#A77F0E", "1028": "#FF9B00", "1032": "#E2A300",
  "1033": "#F99A1C", "1034": "#EB9C52", "1035": "#908370", "1036": "#80643F", "1037": "#F09200",
  "2000": "#DA6E00", "2001": "#BA481B", "2002": "#BF3922", "2003": "#F67828", "2004": "#E25303",
  "2005": "#FF4D06", "2007": "#FFB200", "2008": "#ED6B21", "2009": "#DE5307", "2010": "#D05D28",
  "2011": "#E26E0E", "2012": "#D5654D", "2013": "#923E25", "3000": "#A72920", "3001": "#9B2423",
  "3002": "#9B2321", "3003": "#861A22", "3004": "#6B1C23", "3005": "#59191F", "3007": "#3E2022",
  "3009": "#6D342D", "3011": "#792423", "3012": "#C6846D", "3013": "#972E25", "3014": "#CB7375",
  "3015": "#D8A0A6", "3016": "#A63D2F", "3017": "#CB555D", "3018": "#C73F4A", "3020": "#BB1E10",
  "3022": "#CF6955", "3024": "#FF2D21", "3026": "#FF2A1B", "3027": "#AB273C", "3028": "#CC2C24",
  "3031": "#A63437", "3032": "#701D23", "3033": "#A53A2D", "4001": "#816183", "4002": "#8D3C4B",
  "4003": "#C4618C", "4004": "#651E38", "4005": "#76689A", "4006": "#903373", "4007": "#47243C",
  "4008": "#844C82", "4009": "#9D8692", "4010": "#BC4077", "4011": "#6E6387", "4012": "#6B6B7F",
  "5000": "#314F6F", "5001": "#0F4C64", "5002": "#00387B", "5003": "#1F3855", "5004": "#191E28",
  "5005": "#005387", "5007": "#376B8C", "5008": "#2B3A44", "5009": "#225F78", "5010": "#004F7C",
  "5011": "#1A2B3C", "5012": "#0089B6", "5013": "#193153", "5014": "#637D96", "5015": "#007CB0",
  "5017": "#005B8C", "5018": "#058B8C", "5019": "#005E83", "5020": "#00414B", "5021": "#007577",
  "5022": "#222D5A", "5023": "#42698C", "5024": "#6093AC", "5025": "#21697C", "5026": "#0F3052",
  "6000": "#3C7460", "6001": "#366735", "6002": "#325928", "6003": "#50533C", "6004": "#024442",
  "6005": "#114232", "6006": "#3C392E", "6007": "#2C3222", "6008": "#37342A", "6009": "#27352A",
  "6010": "#4D6F39", "6011": "#6C7C59", "6012": "#303D3A", "6013": "#7D765A", "6014": "#474135",
  "6015": "#3D3D36", "6016": "#00694C", "6017": "#587F40", "6018": "#61993B", "6019": "#B9CEAC",
  "6020": "#37422F", "6021": "#8A9977", "6022": "#3A3327", "6024": "#008351", "6025": "#5E6E3B",
  "6026": "#005F4E", "6027": "#7EBAB5", "6028": "#315442", "6029": "#006F3D", "6032": "#237F52",
  "6033": "#46877F", "6034": "#7AACAC", "6035": "#194D25", "6036": "#04574B", "6037": "#008B29",
  "6038": "#00B51A", "7000": "#7A888E", "7001": "#8C969D", "7002": "#817863", "7003": "#7A7669",
  "7004": "#9B9B9B", "7005": "#6C6E6B", "7006": "#766A5E", "7008": "#745E3D", "7009": "#5D6058",
  "7010": "#585C56", "7011": "#52595D", "7012": "#575D5E", "7013": "#575044", "7015": "#4F5358",
  "7016": "#383E42", "7021": "#2F3234", "7022": "#4C4A44", "7023": "#808076", "7024": "#45494E",
  "7026": "#374345", "7030": "#928E85", "7031": "#5B686D", "7032": "#B5B0A1", "7033": "#7F8274",
  "7034": "#92886F", "7035": "#C5C7C4", "7036": "#979392", "7037": "#7A7B7A", "7038": "#B0B0A9",
  "7039": "#6B665E", "7040": "#989EA1", "7042": "#8E9291", "7043": "#4F5250", "7044": "#B7B3A8",
  "7045": "#8D9295", "7046": "#7F868A", "7047": "#C8C8C7", "7048": "#817B73", "8000": "#89693E",
  "8001": "#9D622B", "8002": "#794D3E", "8003": "#7E4B26", "8004": "#8D4931", "8007": "#70452A",
  "8008": "#724A25", "8011": "#5A3826", "8012": "#66332B", "8014": "#4A3526", "8015": "#5E2F26",
  "8016": "#4C2B20", "8017": "#442F29", "8019": "#3D3635", "8022": "#1A1718", "8023": "#A45729",
  "8024": "#795038", "8025": "#755847", "8028": "#513A2A", "8029": "#7F4031", "9001": "#E9E0D2",
  "9002": "#D7D5CB", "9003": "#ECECE7", "9004": "#2B2B2C", "9005": "#0E0E10", "9006": "#A1A1A0",
  "9007": "#878581", "9010": "#F1ECE1", "9011": "#27292B", "9016": "#F1F0EA", "9017": "#2A292A",
  "9018": "#C8CBC4", "9022": "#858583", "9023": "#797B7A",
};

export const RAL_NAMES_PL: Record<string, string> = {
  "1000": "Zielony beż", "1001": "Beż", "1002": "Piaskowy żółty", "1003": "Żółty sygnałowy", "1004": "Złoty żółty",
  "1005": "Miodowy żółty", "1006": "Żółty kukurydziany", "1007": "Żółty narcyzowy", "1011": "Brązowy beż", "1012": "Cytrynowy żółty",
  "1013": "Perłowy biały", "1014": "Kość słoniowa", "1015": "Jasne kość słoniowa", "1016": "Siarkowy żółty", "1017": "Szafranowy żółty",
  "1018": "Cynkowy żółty", "1019": "Szary beż", "1020": "Oliwkowy żółty", "1021": "Żółty rzepakowy", "1023": "Żółty ruchu",
  "1024": "Ochrowy żółty", "1026": "Luminizujący żółty", "1027": "Curry", "1028": "Melonowy żółty", "1032": "Żółty janowcowy",
  "1033": "Żółty dalii", "1034": "Pastelowy żółty", "1035": "Perłowy beż", "1036": "Perłowy złoty", "1037": "Słoneczny żółty",
  "2000": "Żółty pomarańczowy", "2001": "Czerwony pomarańczowy", "2002": "Cynober", "2003": "Pastelowy pomarańczowy", "2004": "Czysty pomarańczowy",
  "2005": "Luminizujący pomarańczowy", "2007": "Jasny luminizujący pomarańczowy", "2008": "Jasny czerwony pomarańczowy", "2009": "Pomarańczowy ruchu",
  "2010": "Pomarańczowy sygnałowy", "2011": "Głęboki pomarańczowy", "2012": "Łososiowy pomarańczowy", "2013": "Perłowy pomarańczowy",
  "3000": "Czerwony płomienny", "3001": "Czerwony sygnałowy", "3002": "Karminowy czerwony", "3003": "Rubinowy czerwony", "3004": "Purpurowy czerwony",
  "3005": "Czerwony winny", "3007": "Czarny czerwony", "3009": "Czerwony tlenkowy", "3011": "Brązowy czerwony", "3012": "Beżowy czerwony",
  "3013": "Czerwony pomidorowy", "3014": "Różowy antyczny", "3015": "Jasny różowy", "3016": "Koralowy czerwony", "3017": "Różowy",
  "3018": "Czerwony truskawkowy", "3020": "Czerwony ruchu", "3022": "Łososiowy różowy", "3024": "Luminizujący czerwony",
  "3026": "Jasny luminizujący czerwony", "3027": "Czerwony malinowy", "3028": "Czysty czerwony", "3031": "Czerwony orientalny",
  "3032": "Perłowy rubinowy", "3033": "Perłowy różowy", "4001": "Czerwony liliowy", "4002": "Czerwony fioletowy", "4003": "Fioletowy wrzosowy",
  "4004": "Fioletowy bordowy", "4005": "Niebieski liliowy", "4006": "Fioletowy ruchu", "4007": "Fioletowy purpurowy",
  "4008": "Fioletowy sygnałowy", "4009": "Pastelowy fioletowy", "4010": "Telemagenta", "4011": "Perłowy fioletowy",
  "4012": "Perłowy jeżynowy", "5000": "Fioletowy niebieski", "5001": "Zielony niebieski", "5002": "Ultramaryna", "5003": "Szafir niebieski",
  "5004": "Czarny niebieski", "5005": "Niebieski sygnałowy", "5007": "Błyszczący niebieski", "5008": "Szary niebieski",
  "5009": "Błękitny niebieski", "5010": "Goryczkowy niebieski", "5011": "Stalowy niebieski", "5012": "Jasny niebieski",
  "5013": "Kobaltowy niebieski", "5014": "Niebieski gołębi", "5015": "Błękit nieba", "5017": "Niebieski ruchu",
  "5018": "Turkusowy niebieski", "5019": "Niebieski Capri", "5020": "Oceaniczny niebieski", "5021": "Wodny niebieski",
  "5022": "Nocny niebieski", "5023": "Odległy niebieski", "5024": "Pastelowy niebieski", "5025": "Perłowy goryczkowy",
  "5026": "Perłowy nocny", "6000": "Patynowy zielony", "6001": "Szmaragdowy zielony", "6002": "Liściowy zielony", "6003": "Oliwkowy zielony",
  "6004": "Niebieski zielony", "6005": "Mchowy zielony", "6006": "Szary oliwkowy", "6007": "Butelkowy zielony", "6008": "Brązowy zielony",
  "6009": "Jodłowy zielony", "6010": "Trawiasty zielony", "6011": "Zielony rezeda", "6012": "Czarny zielony", "6013": "Trzcinowy zielony",
  "6014": "Żółty oliwkowy", "6015": "Czarny oliwkowy", "6016": "Turkusowy zielony", "6017": "Majowy zielony", "6018": "Żółty zielony",
  "6019": "Pastelowy zielony", "6020": "Chromowy zielony", "6021": "Blady zielony", "6022": "Oliwkowy khaki", "6024": "Zielony ruchu",
  "6025": "Paprociowy zielony", "6026": "Opalowy zielony", "6027": "Jasny zielony", "6028": "Sosnowy zielony", "6029": "Miętowy zielony",
  "6032": "Zielony sygnałowy", "6033": "Miętowy turkusowy", "6034": "Pastelowy turkusowy", "6035": "Perłowy zielony",
  "6036": "Perłowy opalowy", "6037": "Czysty zielony", "6038": "Luminizujący zielony", "7000": "Szary wiewiórkowy",
  "7001": "Srebrny szary", "7002": "Oliwkowy szary", "7003": "Mchowy szary", "7004": "Szary sygnałowy", "7005": "Szary mysi",
  "7006": "Beżowy szary", "7008": "Khaki szary", "7009": "Zielony szary", "7010": "Szary brezentowy", "7011": "Żelazny szary",
  "7012": "Bazaltowy szary", "7013": "Brązowy szary", "7015": "Łupkowy szary", "7016": "Antracyt", "7021": "Czarny szary",
  "7022": "Umbrowy szary", "7023": "Betonowy szary", "7024": "Grafitowy szary", "7026": "Granitowy szary",
  "7030": "Kamienny szary", "7031": "Niebieski szary", "7032": "Kamykowy szary", "7033": "Cementowy szary", "7034": "Żółty szary",
  "7035": "Jasny szary", "7036": "Platynowy szary", "7037": "Pylisty szary", "7038": "Agatowy szary", "7039": "Kwarowy szary",
  "7040": "Okienny szary", "7042": "Szary ruchu A", "7043": "Szary ruchu B", "7044": "Jedwabny szary", "7045": "Teleszary 1",
  "7046": "Teleszary 2", "7047": "Teleszary 4", "7048": "Perłowy mysi", "8000": "Zielony brązowy", "8001": "Ochrowy brązowy",
  "8002": "Brązowy sygnałowy", "8003": "Gliniasty brązowy", "8004": "Miedziany brązowy", "8007": "Płowy brązowy",
  "8008": "Oliwkowy brązowy", "8011": "Orzechowy brązowy", "8012": "Czerwony brązowy", "8014": "Sepiowy brązowy",
  "8015": "Kasztanowy brązowy", "8016": "Mahoniowy brązowy", "8017": "Brąz czekoladowy", "8019": "Szary brązowy",
  "8022": "Czarny brązowy", "8023": "Pomarańczowy brązowy", "8024": "Beżowy brązowy", "8025": "Blady brązowy",
  "8028": "Terenowy brązowy", "8029": "Perłowy miedziany", "9001": "Kremowy", "9002": "Szary biały",
  "9003": "Biały sygnałowy", "9004": "Czarny sygnałowy", "9005": "Czarny głęboki", "9006": "Białe aluminium",
  "9007": "Szare aluminium", "9010": "Czysty biały", "9011": "Grafitowy czarny", "9016": "Biały ruchu",
  "9017": "Czarny ruchu", "9018": "Biały papirusowy", "9022": "Perłowy jasny szary", "9023": "Perłowy ciemny szary",
};

export function ralCodeToNamePl(code: string | undefined): string | null {
  const num = extractRalCode(code);
  if (!num) return null;
  return RAL_NAMES_PL[num] ?? null;
}

export function extractRalCode(code: string | undefined): string | null {
  if (!code || typeof code !== "string") return null;
  const s = code.trim();
  const match = s.match(/(?:RAL\s*)?(\d{4,5})/i);
  return match ? match[1] : null;
}

export function ralCodeToHex(code: string | undefined): string | null {
  const num = extractRalCode(code);
  if (!num) return null;
  return RAL_HEX[num] ?? null;
}

export function getRalDisplayColor(code: string | undefined): string | null {
  return ralCodeToHex(code);
}
