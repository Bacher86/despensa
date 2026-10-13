// Recetario de Despensa de Casa.
// Cada ingrediente: I(palabras que lo identifican separadas por |, nombre, cantidad en texto, cantidad, unidad, opcional, palabras que NO)
// Las palabras van en minúscula y sin tildes. "mom": momentos del día. "prot": ingrediente principal (para no repetir en el menú).
const I = (claves, nombre, texto, cant = 0, unidad = "u", opc = false, no = "") => ({ claves: claves.split("|"), nombre, texto, cant, unidad, opc, no });
const R = (id, n, t, p, tipo, mom, prot, tags, ing, pasos) => ({ id, n, t, p, tipo, mom, prot, tags, ing, pasos });
const ALM = ["almuerzo", "cena"], DES = ["desayuno", "merienda"];

// ingredientes que se repiten
const papa = (t = "1 kg", c = 1) => I("papa", "Papas", t, c, "kg");
const huevo = (n = 2, opc = false) => I("huevo", n === 1 ? "Huevo" : "Huevos", String(n), n, "u", opc);
const cebolla = (n = 1, opc = false) => I("cebolla", "Cebolla", String(n), n, "u", opc, "verdeo");
const leche = (t, c, opc = false) => I("leche", "Leche", t, c, "L", opc, "dulce|polvo|condensada|coco");
const harina = (t, c, opc = false) => I("harina", "Harina", t, c, "kg", opc, "maiz|mandioca");
const azucar = (t, c) => I("azucar", "Azúcar", t, c, "kg", false, "impalpable");
const manteca = (t = "una cucharada", c = 0, opc = true) => I("manteca", "Manteca", t, c, "u", opc, "mani");
const queso = (t = "a gusto", c = 0.1, opc = true) => I("queso cremoso|mozzarella|muzzarella|queso de maquina|queso fresco|queso", "Queso", t, c, "kg", opc, "rallado|crema|untable|blanco");
const rallado = (opc = true) => I("queso rallado|reggianito|parmesano", "Queso rallado", "a gusto", 0, "u", opc);
const tomate = (opc = false) => I("pure de tomate|tomate triturado|salsa de tomate|tomate perita|tomate", "Puré o salsa de tomate", "1 caja", 1, "u", opc, "cherry");
const fideos = (t = "1 paquete", c = 1) => I("fideo|spaghetti|tallarin|mostachol|tirabuzon|mono|penne|cinta|ave maria|codito", "Fideos", t, c, "paquete");
const pan = (t, c, opc = false) => I("pan lactal|pan frances|pan de campo|pan|baguette|flauta|mignon", "Pan", t, c, "paquete", opc, "rallado|hamburguesa|pancho|arabe|dulce");
const rallar = (opc = false) => I("pan rallado|rebozador", "Pan rallado", "1 taza", 0, "u", opc);
const pollo = (t = "1 kg", c = 1) => I("pollo|pata muslo|pechuga|suprema|muslo", "Pollo", t, c, "kg", false, "picad|caldo|hamburguesa|nugget|medallon");
const picada = (t = "500 g", c = 0.5, opc = false) => I("carne picada|picada", "Carne picada", t, c, "kg", opc);
const tapasTarta = () => I("tapa de tarta|tapas de tarta|tapas para tarta|masa de tarta|tapa pascualina|pascualina", "Tapas de tarta", "1 paquete", 1);
const tapasEmp = () => I("tapa de empanada|tapas de empanada|tapas para empanada|tapas de copetin", "Tapas de empanadas", "12", 1, "paquete");
const crema = (opc = false) => I("crema de leche|crema", "Crema de leche", "1 pote", 1, "u", opc, "queso|helado|batata|dental|mani|untable");
const jamon = (t = "200 g", c = 0.2, opc = false) => I("jamon|fiambre", "Jamón cocido", t, c, "kg", opc, "crudo");
const verdeo = (opc = true) => I("cebolla de verdeo|verdeo", "Cebolla de verdeo", "2 tallos", 0, "u", opc);
const acelga = () => I("acelga|espinaca", "Acelga o espinaca", "1 atado", 1);
const zanahoria = (n = 2, opc = false) => I("zanahoria", "Zanahoria", String(n), n, "u", opc);
const morron = (opc = true) => I("morron|pimiento|aji morron", "Morrón", "1", 1, "u", opc, "molido");
const arroz = (t = "1 taza", c = 0.25) => I("arroz", "Arroz", t, c, "paquete", false, "con leche|galleta|yamani integral harina");
const banana = (n = 2) => I("banana", "Bananas", String(n), n);
const ddl = (t = "a gusto", c = 0, opc = false) => I("dulce de leche", "Dulce de leche", t, c, "u", opc);

const limon = (t = "1", c = 1, opc = false) => I("limon|lima", "Limón", t, c, "u", opc, "jugo en polvo|galletita");
const ajo = (t = "2 dientes", opc = true) => I("ajo", "Ajo", t, 0, "u", opc, "polvo|deshidratado|aji");
const perejil = (opc = true) => I("perejil", "Perejil", "un puñado", 0, "u", opc);
const vino = (t = "1 vaso", c = 0.25, opc = false) => I("vino tinto|malbec|vino", "Vino tinto", t, c, "L", opc, "blanco|vinagre");
const vinoBlanco = (t = "1 vaso", c = 0.2, opc = false) => I("vino blanco|vino", "Vino blanco", t, c, "L", opc, "tinto|malbec|vinagre");
const papaSola = (t, c) => I("papa", "Papas", t, c, "kg");
const batata = (t = "1 kg", c = 1) => I("batata|boniato", "Batatas", t, c, "kg", false, "dulce");
const calabaza = (t = "1 kg", c = 1) => I("calabaza|zapallo|anco|cabutia|butternut", "Calabaza", t, c, "kg", false, "zapallito");
const hongos = (t = "250 g", c = 0.25) => I("champinon|champignon|hongo|portobello|girgola", "Hongos", t, c, "kg");
const ricota = (t = "250 g", c = 0.25) => I("ricota|ricotta", "Ricota", t, c, "kg");
const rucula = (opc = false) => I("rucula", "Rúcula", "1 atado", 1, "u", opc);
const lechuga = (opc = false) => I("lechuga|mix de hojas|hojas verdes", "Lechuga", "1", 1, "u", opc);
const tomateFresco = (n = 2, opc = false) => I("tomate perita|tomate redondo|tomate cherry|cherry|tomate", "Tomates", String(n), n, "u", opc, "pure|triturado|salsa|extracto|seco");
const palta = (n = 1, opc = false) => I("palta|aguacate", "Palta", String(n), n, "u", opc);
const miel = (t = "2 cucharadas", opc = false) => I("miel", "Miel", t, 0, "u", opc);
const salmon = (t = "500 g", c = 0.5) => I("salmon|trucha", "Salmón o trucha", t, c, "kg", false, "lata|ahumado");
const pescadoBlanco = (t = "600 g", c = 0.6) => I("merluza|abadejo|lenguado|brotola|filet de pescado|pescado|corvina|pejerrey", "Filet de pescado", t, c, "kg", false, "lata|rebozado|bastoncito");
const langostinos = (t = "500 g", c = 0.5) => I("langostino|camaron|gamba", "Langostinos", t, c, "kg");
const cerdo = (t = "1 kg", c = 1, nombre = "Cerdo") => I("bondiola|carre de cerdo|solomillo|matambre de cerdo|pechito|costilla de cerdo|cerdo|chuleta", nombre, t, c, "kg", false, "picad|salchicha|chorizo|jamon");
const carneHorno = (t = "1 kg", c = 1) => I("peceto|colita de cuadril|cuadril|nalga|bola de lomo|tapa de nalga|roast beef|carne", "Carne para horno", t, c, "kg", false, "picad|milanesa");
const lomo = (t = "800 g", c = 0.8) => I("lomo|ojo de bife|bife de chorizo|entrecot", "Lomo o bife ancho", t, c, "kg", false, "bola de lomo|cerdo");
const garbanzos = (t = "1 lata", c = 1) => I("garbanzo", "Garbanzos", t, c, "lata");
const choclo = (t = "1 lata", c = 1, opc = false) => I("choclo|maiz dulce|granos de choclo", "Choclo", t, c, "lata", opc, "crema de choclo|harina|pisingallo");
const puerro = (opc = false) => I("puerro", "Puerro", "2", 2, "u", opc);
const yogur = (t = "1 pote", c = 1, opc = false) => I("yogur|yogurt", "Yogur natural", t, c, "u", opc, "bebible|frutilla|vainilla");
const quesoCrema = (t = "300 g", c = 0.3) => I("queso crema|queso blanco|queso untable|philadelphia|casancrem", "Queso crema", t, c, "kg");
const chocolate = (t = "200 g", c = 0.2) => I("chocolate|cacao", "Chocolate", t, c, "kg", false, "leche chocolatada|chocolina|galletita|alfajor|cereal");
const frutosRojos = (opc = false) => I("frutos rojos|frutilla|frambuesa|arandano|mora", "Frutos rojos", "250 g", 0.25, "kg", opc, "mermelada|yogur|gelatina");
const manzana = (n = 4) => I("manzana", "Manzanas", String(n), n, "u", false, "pure|jugo");
const pera = (n = 4) => I("pera", "Peras", String(n), n);
const avena = (t = "1 taza", c = 0.1) => I("avena", "Avena", t, c, "kg", false, "galletita|barra");
const nueces = (opc = true) => I("nuez|nueces|almendra|avellana|castana", "Frutos secos", "un puñado", 0, "u", opc, "moscada|coco");
const coco = (opc = false) => I("leche de coco|crema de coco", "Leche de coco", "1 lata", 1, "lata", opc);
const jamonCrudo = (t = "100 g", c = 0.1, opc = false) => I("jamon crudo|crudo|serrano|prosciutto", "Jamón crudo", t, c, "kg", opc);
const panceta = (t = "150 g", c = 0.15, opc = false) => I("panceta|bacon|tocino", "Panceta", t, c, "kg", opc);
const parmesano = (opc = false) => I("parmesano|reggianito|grana padano|sardo|queso rallado", "Parmesano o reggianito", "100 g", 0.1, "kg", opc);
const azul = (opc = false) => I("queso azul|roquefort|gorgonzola", "Queso azul", "100 g", 0.1, "kg", opc);
const cabra = (opc = false) => I("queso de cabra|chevre", "Queso de cabra", "150 g", 0.15, "kg", opc);
const mozza = (t = "200 g", c = 0.2, opc = false) => I("mozzarella|muzzarella|burrata|bocconcini|queso cremoso", "Mozzarella", t, c, "kg", opc, "rallado");
const provolone = () => I("provoleta|provolone", "Provoleta", "1", 1);
const espinaca = () => I("espinaca|acelga", "Espinaca o acelga", "1 atado", 1);
const repollo = () => I("repollo|col", "Repollo", "1", 1, "u", false, "coliflor|colorado");
const berenjena = (n = 2) => I("berenjena", "Berenjenas", String(n), n);
const zapallito = (n = 3) => I("zapallito|zucchini|calabacin", "Zapallitos", String(n), n);
const cerveza = (t = "1 lata", c = 0.5, opc = false) => I("cerveza", "Cerveza", t, c, "L", opc);
const mostaza = (opc = true) => I("mostaza", "Mostaza", "2 cucharadas", 0, "u", opc);
const mayo = (opc = true) => I("mayonesa", "Mayonesa", "a gusto", 0, "u", opc);
const atun = (n = 1) => I("atun|caballa", "Atún", String(n) + (n > 1 ? " latas" : " lata"), n, "lata");
const lentejas = (t = "1 taza", c = 0.25) => I("lenteja", "Lentejas", t, c, "paquete");
const salchicha = () => I("chorizo|salchicha parrillera|salchicha", "Chorizo", "4", 0.4, "kg", false, "viena|cantimpalo");
const tortillas = () => I("tortilla de trigo|rapiditas|tortillas|wrap|pan arabe|pan pita", "Tortillas o rapiditas", "1 paquete", 1);
const masaPizza = () => I("prepizza|masa de pizza|pizzeta", "Prepizza", "1", 1);
const polvoHornear = () => I("polvo de hornear|polvo para hornear|royal", "Polvo de hornear", "1 cucharadita", 0, "u", true);
const levadura = () => I("levadura", "Levadura", "1 sobre", 1);
const vainillas = () => I("vainilla", "Vainillas", "1 paquete", 1, "paquete", false, "esencia");
const cafe = (opc = false) => I("cafe", "Café", "1 taza fuerte", 0, "u", opc, "con leche");
const mascarpone = () => I("mascarpone|queso crema|queso blanco", "Mascarpone o queso crema", "500 g", 0.5, "kg");
const gelatinaSin = () => I("gelatina sin sabor|colapez", "Gelatina sin sabor", "1 sobre", 1);
const pollo2 = (t = "1 kg", c = 1, nombre = "Pollo") => I("pollo|pata muslo|pechuga|suprema|muslo", nombre, t, c, "kg", false, "picad|caldo|hamburguesa|nugget|medallon");
const pechuga = (t = "600 g", c = 0.6) => I("pechuga|suprema|filet de pollo", "Pechugas de pollo", t, c, "kg");
const carneCubos = (t = "800 g", c = 0.8) => I("carnaza|cuadrada|roast beef|paleta|osobuco|tortuguita|carne para guiso|carne", "Carne para guisar", t, c, "kg", false, "picad|milanesa");
const cremaChoclo = (t = "1 lata", c = 1) => I("crema de choclo|choclo|maiz dulce", "Crema de choclo o choclo", t, c, "lata");

export default [
  /* ---------- clásicos de todos los días ---------- */
  R("tortilla", "Tortilla de papas", 40, 4, "salado", ALM, "huevo", ["veg"], [papa(), huevo(6), cebolla(1, true)],
    ["Pelá las papas y cortalas en cubitos finos. Si usás cebolla, cortala en pluma.", "Freílas en bastante aceite a fuego medio hasta que estén tiernas, sin que se doren. Escurrí.", "Batí los huevos con sal, mezclá con las papas y dejá reposar 5 minutos.", "Cociná en una sartén con un hilo de aceite unos 5 minutos de cada lado. Para darla vuelta usá un plato."]),
  R("milapure", "Milanesas con puré", 40, 4, "salado", ALM, "carne", [], [I("milanesa", "Milanesas", "4 a 6", 0.5, "kg"), papa(), leche("un chorro", 0.1, true), manteca()],
    ["Hervé las papas peladas en agua con sal hasta que se deshagan con un tenedor (20 minutos).", "Mientras, cociná las milanesas al horno (15 minutos por lado) o fritas.", "Pisá las papas con la manteca, un chorro de leche caliente, sal y nuez moscada si tenés."]),
  R("milacarne", "Milanesas caseras", 40, 4, "salado", ALM, "carne", [], [I("nalga|bola de lomo|peceto|cuadrada|carne para milanesa|cuadril", "Carne para milanesas", "800 g", 0.8, "kg"), huevo(2), rallar()],
    ["Batí los huevos con sal, ajo y perejil picados.", "Pasá cada bife por el huevo y después por el pan rallado, apretando bien.", "Cocinalas al horno en una placa aceitada 15 minutos por lado, o fritas."]),
  R("milapollo", "Milanesas de pollo", 35, 4, "salado", ALM, "pollo", [], [I("pechuga|suprema|filet de pollo", "Pechugas de pollo", "4", 0.8, "kg"), huevo(2), rallar()],
    ["Abrí las pechugas en filetes finos.", "Pasalas por huevo batido con sal y ajo, y después por pan rallado.", "Al horno 12 minutos por lado o fritas."]),
  R("napo", "Milanesa a la napolitana", 45, 4, "salado", ["cena"], "carne", ["horno"], [I("milanesa", "Milanesas", "4", 0.5, "kg"), jamon("4 fetas", 0.1), queso("150 g", 0.15, false), tomate()],
    ["Cociná las milanesas al horno.", "Ponele a cada una salsa de tomate, una feta de jamón y queso. Orégano arriba.", "Volvé al horno hasta que el queso se derrita."]),
  R("supnapo", "Suprema napolitana", 50, 4, "salado", ["cena"], "pollo", ["horno"], [I("pechuga|suprema", "Supremas de pollo", "4", 0.8, "kg"), huevo(2), rallar(), jamon("4 fetas", 0.1), queso("150 g", 0.15, false), tomate()],
    ["Empaná las supremas con huevo y pan rallado.", "Cocinalas al horno 25 minutos.", "Cubrilas con salsa, jamón y queso, y gratiná 5 minutos más."]),
  R("tuco", "Fideos con tuco", 35, 4, "salado", ALM, "pasta", [], [fideos(), tomate(), cebolla(), picada("300 g", 0.3, true), rallado()],
    ["Rehogá la cebolla picada en aceite. Si usás carne picada, sumala y dorala.", "Agregá el tomate, sal, orégano y una pizca de azúcar. Cociná a fuego bajo 20 minutos.", "Hervé los fideos en agua con sal según el paquete, escurrí y serví con el tuco y queso rallado."]),
  R("fideosmanteca", "Fideos con manteca y queso", 15, 2, "salado", ALM, "pasta", ["veg"], [fideos("medio paquete", 0.5), manteca("2 cucharadas", 0, false), rallado()],
    ["Hervé los fideos en agua con sal.", "Escurrí y mezclá con la manteca y bastante queso rallado."]),
  R("fideoscrema", "Fideos con crema y jamón", 20, 3, "salado", ALM, "pasta", [], [fideos(), crema(), jamon("150 g", 0.15), rallado()],
    ["Hervé los fideos.", "En una sartén calentá la crema con el jamón en tiras, sal, pimienta y nuez moscada.", "Mezclá con los fideos y serví con queso rallado."]),
  R("pesto", "Fideos al pesto", 20, 3, "salado", ALM, "pasta", ["veg"], [fideos(), I("albahaca", "Albahaca", "1 atado", 1), I("ajo", "Ajo", "1 diente", 0, "u", true), rallado(), I("nuez|nueces", "Nueces", "un puñado", 0, "u", true)],
    ["Procesá la albahaca con ajo, queso rallado, nueces si tenés, sal y bastante aceite.", "Hervé los fideos y mezclalos con el pesto fuera del fuego."]),
  R("brocoli", "Fideos con brócoli", 20, 3, "salado", ALM, "pasta", ["veg"], [fideos(), I("brocoli", "Brócoli", "1", 1), I("ajo", "Ajo", "2 dientes", 0, "u", true), rallado()],
    ["Hervé el brócoli en ramitos junto con los fideos en la misma olla.", "Dorá ajo en aceite, sumá fideos y brócoli escurridos, y saltá un minuto.", "Queso rallado arriba."]),
  R("gratinados", "Fideos gratinados con salsa blanca", 40, 4, "salado", ["cena"], "pasta", ["veg", "horno"], [fideos(), leche("1/2 litro", 0.5), manteca("2 cucharadas", 0, false), harina("2 cucharadas", 0), queso("200 g", 0.2, false)],
    ["Hervé los fideos (cortos van mejor).", "Hacé salsa blanca: derretí la manteca, sumá la harina, y de a poco la leche revolviendo hasta que espese. Sal y nuez moscada.", "Mezclá con los fideos, poné en una fuente con queso arriba y gratiná 15 minutos."]),
  R("ravioles", "Ravioles o sorrentinos con salsa", 20, 3, "salado", ALM, "pasta", [], [I("ravioles|sorrentino|capeleti|agnolotti|tortelin", "Pasta rellena", "1 caja", 1), tomate(true), crema(true), rallado()],
    ["Hervé la pasta en abundante agua con sal hasta que suba (unos 5 minutos).", "Calentá la salsa: tomate, crema o las dos juntas (salsa rosa).", "Serví con queso rallado."]),
  R("lasagna", "Lasaña de carne", 75, 6, "salado", ["cena"], "pasta", ["horno"], [I("lasagna|lasana|masa para lasagna|panqueques", "Masa de lasaña", "1 paquete", 1), picada(), tomate(), cebolla(), queso("300 g", 0.3, false)],
    ["Hacé un tuco espeso con la cebolla, la carne y el tomate.", "En una fuente armá capas: salsa, masa, queso. Repetí.", "Terminá con salsa y queso. Horno medio 35 minutos."]),
  R("canelones", "Canelones de verdura", 70, 4, "salado", ["cena"], "verdura", ["veg", "horno"], [I("panqueque|masa de canelon|canelones", "Panqueques o masa", "12", 1), acelga(), I("ricota", "Ricota", "250 g", 0.25, "kg"), tomate(), rallado()],
    ["Hervé la acelga, escurrila muy bien y picala.", "Mezclala con la ricota, queso rallado, sal y nuez moscada.", "Rellená los panqueques, enrollalos, cubrí con salsa y queso, y horneá 20 minutos."]),
  R("noquis", "Ñoquis de papa", 60, 4, "salado", ALM, "pasta", ["veg"], [papa(), harina("300 g", 0.3), huevo(1, true), tomate(true)],
    ["Hervé las papas con cáscara, pelalas y hacé un puré bien liso.", "Sumá sal, el huevo y la harina de a poco hasta tener una masa suave.", "Armá cilindros, cortá trocitos y hervilos: están listos cuando suben.", "Servilos con la salsa que tengas."]),
  R("guisofideos", "Guiso de fideos", 50, 4, "salado", ALM, "carne", [], [fideos("medio paquete", 0.5), I("carne|osobuco|roast beef|carnaza|cuadrada", "Carne en cubos", "500 g", 0.5, "kg", false, "picada"), papa("2", 0.4), cebolla(), tomate(true)],
    ["Dorá la carne en cubos con la cebolla.", "Agregá tomate, papas en cubos y agua o caldo. Cociná 20 minutos.", "Sumá los fideos y cociná hasta que estén a punto, agregando líquido si hace falta."]),
  R("arrozpollo", "Arroz con pollo", 45, 4, "salado", ALM, "pollo", [], [arroz("2 tazas", 0.5), pollo(), cebolla(), morron(), I("caldo", "Caldo", "1 cubo", 1, "u", true)],
    ["Dorá el pollo en presas en una olla con aceite. Sacalo y reservá.", "En la misma olla rehogá la cebolla y el morrón picados.", "Sumá el arroz, revolvé un minuto y agregá el doble de agua caliente (o caldo) y el pollo.", "Cociná tapado a fuego bajo 18 a 20 minutos."]),
  R("guisoarroz", "Guiso de arroz", 45, 4, "salado", ALM, "carne", [], [arroz("1 taza y media", 0.4), I("carne|osobuco|roast beef|carnaza|cuadrada|picada", "Carne", "500 g", 0.5, "kg"), cebolla(), morron(), papa("2", 0.4)],
    ["Dorá la carne en cubos, sumá la cebolla y el morrón.", "Agregá el arroz, las papas en cubos y caldo o agua hasta cubrir bien.", "Cociná 20 minutos, sumando líquido si hace falta. Pimentón y laurel si tenés."]),
  R("arrozprimavera", "Arroz primavera", 25, 3, "salado", ALM, "verdura", ["veg"], [arroz(), zanahoria(1), I("arveja", "Arvejas", "1 lata", 1, "lata", true), I("choclo", "Choclo", "1 lata", 1, "lata", true), morron()],
    ["Hervé el arroz.", "Salteá la zanahoria rallada y el morrón en aceite, sumá arvejas y choclo.", "Mezclá con el arroz y condimentá."]),
  R("arrozfrito", "Arroz frito con huevo", 20, 2, "salado", ALM, "huevo", ["veg"], [arroz(), huevo(2), verdeo(), I("salsa de soja|soja", "Salsa de soja", "un chorro", 0, "u", true), zanahoria(1, true)],
    ["Ideal con arroz del día anterior. Si no, hervilo y dejalo enfriar.", "Revolvé los huevos en una sartén bien caliente y reservá.", "Salteá las verduras, sumá el arroz, la soja y el huevo. Verdeo arriba."]),
  R("risotto", "Risotto de hongos", 35, 3, "salado", ["cena"], "verdura", ["veg"], [arroz("1 taza y media", 0.4), I("champinon|hongo|portobello", "Hongos", "250 g", 0.25, "kg"), cebolla(), rallado(false), manteca()],
    ["Rehogá la cebolla, sumá los hongos y después el arroz sin lavar.", "Agregá caldo caliente de a un cucharón, revolviendo, hasta que el arroz esté cremoso (18 minutos).", "Fuera del fuego, manteca y queso rallado."]),
  R("ensarroz", "Ensalada de arroz con atún", 20, 3, "salado", ["almuerzo"], "pescado", [], [arroz(), I("atun", "Atún", "1 lata", 1, "lata"), huevo(2, true), I("choclo", "Choclo", "1 lata", 1, "lata", true), I("tomate", "Tomate", "1", 1, "u", true, "pure|salsa|triturado")],
    ["Hervé el arroz y enfrialo bajo el agua.", "Mezclá con el atún, huevo duro picado y lo que tengas: choclo, tomate, arvejas.", "Condimentá con aceite, limón o mayonesa."]),
  R("lentejas", "Guiso de lentejas", 60, 6, "salado", ALM, "legumbre", [], [I("lenteja", "Lentejas", "500 g", 1, "paquete"), cebolla(), zanahoria(2, true), papa("2", 0.4), I("chorizo|panceta", "Chorizo o panceta", "2", 0, "u", true), tomate(true)],
    ["Si son lentejas secas, remojalas unas horas antes.", "Rehogá la cebolla (y el chorizo o la panceta en trozos si tenés).", "Agregá las verduras en cubos, las lentejas, el tomate y agua hasta cubrir. Pimentón y laurel.", "Cociná a fuego bajo 40 minutos."]),
  R("porotos", "Guiso de porotos", 60, 6, "salado", ALM, "legumbre", [], [I("poroto|alubia", "Porotos", "500 g", 1, "paquete"), cebolla(), I("chorizo|panceta", "Chorizo o panceta", "2", 0, "u", true), tomate(true), morron()],
    ["Remojá los porotos desde la noche anterior (o usá de lata).", "Rehogá cebolla, morrón y el chorizo en rodajas.", "Sumá porotos, tomate y agua. Cociná 1 hora a fuego bajo hasta que estén tiernos."]),
  R("locro", "Locro", 180, 8, "salado", ["almuerzo"], "legumbre", [], [I("maiz blanco|maiz pisado", "Maíz blanco", "500 g", 1, "paquete"), I("poroto|alubia", "Porotos", "250 g", 0.5, "paquete"), I("zapallo|calabaza", "Zapallo", "1 kg", 1, "kg"), I("chorizo|panceta|falda|pechito|carne", "Carnes (chorizo, panceta, falda)", "1 kg", 1, "kg"), cebolla(1, true)],
    ["Remojá el maíz y los porotos desde la noche anterior.", "Hervilos en una olla grande con agua 1 hora.", "Sumá las carnes en trozos y el zapallo en cubos. Cociná 1 hora y media más, revolviendo seguido, hasta que espese.", "Serví con salsita de cebolla de verdeo, pimentón y aceite."]),
  R("hamblenteja", "Hamburguesas de lentejas", 40, 4, "salado", ALM, "legumbre", ["veg"], [I("lenteja", "Lentejas", "2 tazas cocidas", 0.5, "paquete"), cebolla(), huevo(1, true), I("pan rallado|avena|rebozador", "Pan rallado o avena", "1/2 taza", 0)],
    ["Pisá las lentejas cocidas con la cebolla rehogada, el huevo, sal y comino.", "Sumá pan rallado o avena hasta poder formar medallones.", "Cocinalas en sartén o al horno 10 minutos por lado."]),
  R("pastel", "Pastel de papa", 60, 4, "salado", ["cena"], "carne", ["horno"], [picada(), papa(), cebolla(), huevo(2, true), rallado()],
    ["Hacé un puré con las papas.", "Rehogá la cebolla, sumá la carne y cociná con sal, pimentón y comino. Si tenés, agregá huevo duro picado.", "En una fuente poné la carne y cubrí con el puré. Arriba queso.", "Horno fuerte 20 minutos, hasta que se dore."]),
  R("albondigas", "Albóndigas con salsa", 45, 4, "salado", ALM, "carne", [], [picada(), huevo(1), rallar(true), tomate(), cebolla()],
    ["Mezclá la carne con el huevo, pan rallado, sal, ajo y perejil. Armá bolitas.", "Dorálas en una olla con un poco de aceite.", "Sumá la cebolla picada y el tomate, y cociná tapado 20 minutos. Ideales con arroz, puré o fideos."]),
  R("hamburguesas", "Hamburguesas caseras", 25, 4, "salado", ["cena"], "carne", [], [picada(), huevo(1, true), I("pan de hamburguesa|pan de pancho|pan", "Pan", "4", 4, "u", true, "rallado|lactal"), queso("4 fetas", 0.08)],
    ["Mezclá la carne con sal, pimienta, ajo picado y el huevo.", "Armá 4 bollos y aplastalos.", "Cocinalos a la plancha 4 minutos por lado. Al final, una feta de queso arriba.", "Serví en pan con lo que tengas: tomate, lechuga, huevo frito."]),
  R("bife", "Bife con ensalada", 20, 2, "salado", ALM, "carne", [], [I("bife|churrasco|entrana|vacio|cuadril|nalga|bola de lomo|carne", "Carne para bife", "2 bifes", 0.5, "kg", false, "picada|milanesa"), I("lechuga|tomate|rucula", "Lechuga o tomate", "a gusto", 1, "u", true, "pure|salsa|triturado")],
    ["Sacá la carne de la heladera un rato antes y salala justo antes de cocinar.", "Cocinala en una plancha bien caliente 3 a 4 minutos por lado.", "Acompañá con una ensalada de lo que tengas."]),
  R("criolla", "Bife a la criolla", 60, 4, "salado", ALM, "carne", [], [I("bife|cuadrada|nalga|bola de lomo|carne", "Bifes finos", "4", 0.6, "kg", false, "picada|milanesa"), papa(), cebolla(2), morron(), I("tomate", "Tomate", "2", 2, "u", true, "pure|salsa|triturado")],
    ["En una olla, armá capas de cebolla, morrón, tomate, papa en rodajas y bife. Repetí.", "Condimentá cada capa con sal, ají molido y orégano. Un vaso de agua o caldo.", "Cociná tapado a fuego bajo 45 minutos, sin revolver."]),
  R("carnehorno", "Carne al horno con papas", 90, 6, "salado", ["almuerzo"], "carne", ["horno"], [I("peceto|roast beef|vacio|colita de cuadril|matambre|carne para horno|tapa de asado|pulpa", "Carne para horno", "1,5 kg", 1.5, "kg"), papa(), cebolla(2, true)],
    ["Condimentá la carne con sal, ajo, pimentón y aceite.", "Ponela en una fuente con papas en gajos y cebolla.", "Horno medio 1 hora y cuarto, dando vuelta a mitad de cocción."]),
  R("matambre", "Matambre a la pizza", 90, 4, "salado", ["cena"], "carne", ["horno"], [I("matambre", "Matambre", "1 kg", 1, "kg"), tomate(), queso("250 g", 0.25, false)],
    ["Hervé el matambre en agua con sal 40 minutos (o con leche, queda más tierno).", "Pasalo a una placa, cubrí con salsa, queso y orégano.", "Gratiná en horno fuerte 15 minutos."]),
  R("pollohorno", "Pollo al horno con papas", 70, 4, "salado", ALM, "pollo", ["horno"], [pollo("1,5 kg", 1.5), papa(), cebolla(2, true), I("limon", "Limón", "1", 1, "u", true)],
    ["Condimentá el pollo con sal, pimienta, ajo y jugo de limón si tenés.", "Poné en una fuente con las papas en gajos y la cebolla, con un chorro de aceite.", "Horno fuerte 1 hora, dando vuelta a mitad de cocción."]),
  R("estofado", "Estofado de pollo", 60, 4, "salado", ALM, "pollo", [], [pollo(), papa("3", 0.6), zanahoria(2), cebolla(), tomate(true)],
    ["Dorá el pollo en presas.", "Sumá cebolla, zanahoria y papa en trozos, tomate y un vaso de agua o caldo.", "Cociná tapado 40 minutos a fuego bajo. Laurel y pimentón si tenés."]),
  R("mostaza", "Pollo a la mostaza", 35, 3, "salado", ["cena"], "pollo", [], [I("pechuga|suprema|pollo|pata muslo", "Pollo", "3 pechugas", 0.7, "kg", false, "picad|caldo"), I("mostaza", "Mostaza", "2 cucharadas", 0), crema(true), cebolla(1, true)],
    ["Cortá el pollo en tiras y doralo.", "Sumá cebolla picada, la mostaza y la crema (o un poco de leche). Cociná 10 minutos.", "Va bien con arroz o puré."]),
  R("verdeopollo", "Pollo al verdeo", 35, 3, "salado", ["cena"], "pollo", [], [I("pechuga|suprema|pollo", "Pollo", "3 pechugas", 0.7, "kg", false, "picad|caldo"), verdeo(false), crema()],
    ["Cortá el pollo en cubos y doralo.", "Sumá el verdeo picado y rehogá.", "Agregá la crema, sal y pimienta. Cociná 10 minutos hasta que espese."]),
  R("salteado", "Salteado de pollo y verduras", 25, 2, "salado", ["cena"], "pollo", [], [I("pollo|pechuga", "Pollo", "2 pechugas", 0.5, "kg", false, "picad|caldo"), I("morron|pimiento|zanahoria|zapallito|cebolla|brocoli", "Morrón o zanahoria", "lo que tengas", 1), I("arroz", "Arroz", "1 taza", 0.25, "paquete", true), I("salsa de soja|soja", "Salsa de soja", "un chorro", 0, "u", true)],
    ["Cortá el pollo y las verduras en tiras.", "Salteá el pollo en una sartén bien caliente; sumá las verduras y cociná 5 minutos más.", "Un chorro de soja si tenés. Serví con arroz."]),
  R("fajitas", "Fajitas de pollo", 25, 3, "salado", ["cena"], "pollo", [], [I("tortilla de trigo|rapidita|pan arabe|tortillas|wrap", "Tortillas o rapiditas", "6", 1, "paquete"), I("pollo|pechuga", "Pollo", "2 pechugas", 0.5, "kg", false, "picad|caldo"), morron(false), cebolla()],
    ["Cortá pollo, morrón y cebolla en tiras.", "Saltealos con sal, comino y pimentón.", "Calentá las tortillas y rellenalas. Si tenés queso, palta o tomate, suman."]),
  R("tacos", "Tacos de carne", 25, 3, "salado", ["cena"], "carne", [], [I("tortilla de trigo|tortilla de maiz|rapidita|tortillas|tacos", "Tortillas", "6", 1, "paquete"), picada(), cebolla(), I("tomate", "Tomate", "2", 2, "u", true, "pure|salsa|triturado")],
    ["Rehogá la cebolla, sumá la carne y condimentá con comino, pimentón y ají.", "Picá el tomate.", "Armá los tacos con la carne, tomate y lo que tengas (queso, lechuga, palta)."]),
  R("cerdo", "Cerdo con batatas al horno", 70, 4, "salado", ALM, "cerdo", ["horno"], [I("bondiola|carre|cerdo|solomillo|pechito de cerdo|matambrito", "Cerdo", "1 kg", 1, "kg"), I("batata", "Batatas", "1 kg", 1, "kg"), I("miel|mostaza", "Miel o mostaza", "2 cucharadas", 0, "u", true)],
    ["Condimentá el cerdo con sal, ajo y un poco de miel o mostaza.", "Poné en una fuente con las batatas en rodajas.", "Horno medio 50 minutos."]),
  R("pescado", "Pescado al horno con papas", 45, 3, "salado", ALM, "pescado", ["horno"], [I("merluza|filet|pescado|abadejo|salmon|pollo de mar", "Filet de pescado", "3", 0.6, "kg"), papa("3", 0.6), I("limon", "Limón", "1", 1, "u", true)],
    ["Hervé las papas en rodajas 5 minutos.", "En una fuente aceitada poné las papas y el pescado arriba, con sal, ajo, perejil y limón.", "Horno fuerte 20 minutos."]),
  R("merluza", "Merluza rebozada", 25, 3, "salado", ALM, "pescado", [], [I("merluza|filet|pescado|abadejo", "Filet de merluza", "3", 0.6, "kg"), huevo(2), I("pan rallado|rebozador|harina", "Pan rallado o harina", "1 taza", 0)],
    ["Pasá los filetes por huevo batido con sal y después por pan rallado o harina.", "Freílos o hacelos al horno 10 minutos por lado.", "Con limón y una ensalada o puré."]),
  R("gramajo", "Revuelto gramajo", 25, 2, "salado", ["cena"], "huevo", [], [papa("3", 0.5), huevo(4), jamon("150 g", 0.15), cebolla(1, true), I("arveja", "Arvejas", "1 lata", 1, "lata", true)],
    ["Cortá las papas en bastones finos y freílas hasta que estén crocantes.", "Rehogá la cebolla en pluma y el jamón en tiras.", "Sumá las papas y los huevos batidos; revolvé a fuego bajo hasta que cuajen apenas."]),
  R("omelette", "Omelette de jamón y queso", 10, 1, "salado", ["desayuno", "cena"], "huevo", [], [huevo(3), queso("un poco", 0.05), jamon("2 fetas", 0.05, true)],
    ["Batí los huevos con sal.", "Volcalos en una sartén caliente con un poco de manteca o aceite.", "Cuando empiecen a cuajar, rellená con jamón y queso, doblá a la mitad y serví."]),
  R("tortverdura", "Tortilla de verdura", 30, 3, "salado", ALM, "verdura", ["veg"], [acelga(), huevo(4), cebolla(1, true), rallado()],
    ["Hervé la acelga, escurrila bien y picala.", "Mezclala con la cebolla rehogada, los huevos batidos, queso rallado y sal.", "Cociná en sartén como una tortilla, 5 minutos por lado."]),
  R("revzapallito", "Revuelto de zapallitos", 20, 2, "salado", ["cena"], "verdura", ["veg"], [I("zapallito", "Zapallitos", "3", 3), huevo(3), cebolla()],
    ["Rehogá la cebolla y los zapallitos en cubos hasta que estén tiernos.", "Sumá los huevos batidos y revolvé hasta que cuajen. Sal y pimienta."]),
  R("huevossalsa", "Huevos en salsa de tomate", 25, 2, "salado", ["cena"], "huevo", ["veg"], [huevo(4), tomate(), cebolla(), morron()],
    ["Rehogá la cebolla y el morrón, sumá el tomate con comino y pimentón y cociná 10 minutos.", "Hacé huecos en la salsa y rompé un huevo en cada uno.", "Tapá y cociná hasta que la clara cuaje. Con pan para mojar."]),
  R("zapallitos", "Zapallitos rellenos", 45, 4, "salado", ["cena"], "verdura", ["horno"], [I("zapallito", "Zapallitos", "4", 4), cebolla(), picada("250 g", 0.25, true), queso(), huevo(1, true)],
    ["Hervé los zapallitos enteros 10 minutos, cortalos al medio y vaciá la pulpa.", "Rehogá la cebolla con la pulpa (y la carne si usás). Sumá el huevo y condimentá.", "Rellená, poné queso arriba y horneá 20 minutos."]),
  R("berenjenas", "Berenjenas a la napolitana", 45, 3, "salado", ["cena"], "verdura", ["veg", "horno"], [I("berenjena", "Berenjenas", "2", 2), tomate(), queso("200 g", 0.2, false)],
    ["Cortá las berenjenas en rodajas, salalas y dejalas 15 minutos. Secalas.", "Doralas en una placa aceitada al horno 15 minutos.", "Cubrí con salsa, queso y orégano, y gratiná."]),
  R("milaberenjena", "Milanesas de berenjena", 35, 3, "salado", ALM, "verdura", ["veg"], [I("berenjena", "Berenjenas", "2", 2), huevo(2), rallar()],
    ["Cortá las berenjenas en rodajas de medio centímetro.", "Pasalas por huevo batido y pan rallado.", "Al horno 15 minutos por lado o fritas."]),
  R("buñuelos", "Buñuelos de acelga", 30, 4, "salado", ALM, "verdura", ["veg"], [acelga(), huevo(2), harina("1 taza", 0.15)],
    ["Hervé la acelga, escurrila y picala.", "Mezclá con los huevos, la harina, sal y ajo hasta tener una pasta espesa.", "Freí cucharadas en aceite caliente hasta que doren."]),
  R("croquetas", "Croquetas de arroz", 40, 4, "salado", ALM, "verdura", ["veg"], [arroz("1 taza y media", 0.4), queso("100 g", 0.1, false), huevo(2), rallar()],
    ["Hervé el arroz y dejalo enfriar.", "Mezclalo con un huevo, el queso en cubitos y sal. Armá croquetas.", "Pasalas por huevo y pan rallado, y freílas o hacelas al horno."]),
  R("tarta", "Tarta de jamón y queso", 45, 4, "salado", ["cena"], "fiambre", ["horno"], [tapasTarta(), jamon(), queso("200 g", 0.2, false), huevo(3), leche("un chorro", 0.1, true)],
    ["Forrá una tartera con una tapa.", "Mezclá los huevos batidos con el jamón y el queso en cubos, sal y un chorro de leche.", "Rellená, tapá con la otra tapa y pinchala con un tenedor.", "Horno medio 35 minutos."]),
  R("tartaverdura", "Tarta de verdura", 50, 4, "salado", ["cena"], "verdura", ["veg", "horno"], [tapasTarta(), acelga(), cebolla(), huevo(3), rallado()],
    ["Hervé la acelga, escurrila bien y picala.", "Mezclá con la cebolla rehogada, los huevos, queso rallado, sal y nuez moscada.", "Rellená la tarta, tapá y horneá 35 minutos."]),
  R("tartazapallito", "Tarta de zapallitos", 50, 4, "salado", ["cena"], "verdura", ["veg", "horno"], [tapasTarta(), I("zapallito", "Zapallitos", "4", 4), cebolla(), huevo(3), queso()],
    ["Rehogá la cebolla y los zapallitos rallados o en cubos.", "Mezclá con los huevos, queso y sal.", "Rellená la tarta y horneá 35 minutos."]),
  R("tartachoclo", "Tarta de choclo", 50, 4, "salado", ["cena"], "verdura", ["veg", "horno"], [tapasTarta(), I("choclo", "Choclo", "2 latas", 2, "lata"), cebolla(), huevo(2), leche("un chorro", 0.1, true)],
    ["Rehogá la cebolla y sumá el choclo.", "Agregá un poco de leche o salsa blanca y los huevos. Condimentá.", "Rellená la tarta y horneá 35 minutos."]),
  R("empanadas", "Empanadas de carne", 60, 12, "salado", ["cena"], "carne", ["horno"], [tapasEmp(), picada(), cebolla(2), huevo(2, true), I("aceituna", "Aceitunas", "a gusto", 0, "u", true)],
    ["Rehogá bastante cebolla, sumá la carne y condimentá con comino, pimentón y ají molido. Dejá enfriar.", "Sumá huevo duro y aceitunas picadas si tenés.", "Rellená las tapas y cerralas con repulgue o tenedor.", "Horno fuerte 15 a 20 minutos."]),
  R("empjyq", "Empanadas de jamón y queso", 35, 12, "salado", ["cena"], "fiambre", ["horno"], [tapasEmp(), jamon(), queso("250 g", 0.25, false)],
    ["Cortá el jamón y el queso en cubos.", "Rellená las tapas y cerralas bien para que no se salga el queso.", "Horno fuerte 15 minutos."]),
  R("emppollo", "Empanadas de pollo", 60, 12, "salado", ["cena"], "pollo", ["horno"], [tapasEmp(), pollo("2 pechugas", 0.5), cebolla(2), morron()],
    ["Hervé el pollo y desmenuzalo.", "Rehogá cebolla y morrón, sumá el pollo y condimentá con pimentón y comino.", "Rellená, cerrá y horneá 15 a 20 minutos."]),
  R("pizza", "Pizza casera", 90, 4, "salado", ["cena"], "masa", ["veg", "horno"], [harina("500 g", 0.5), I("levadura", "Levadura", "1 sobre", 1), queso("300 g", 0.3, false), tomate()],
    ["Mezclá la harina con la levadura, sal, un chorro de aceite y 300 ml de agua tibia. Amasá 10 minutos.", "Dejá levar tapada 1 hora, hasta que duplique.", "Estirala en una placa aceitada, poné la salsa con orégano y horneá 10 minutos.", "Agregá el queso y volvé al horno hasta que se derrita."]),
  R("fugazzeta", "Fugazzeta", 40, 4, "salado", ["cena"], "masa", ["veg", "horno"], [I("prepizza|pre pizza|masa de pizza|harina", "Prepizza o masa", "1", 1), cebolla(2), queso("300 g", 0.3, false)],
    ["Cortá la cebolla en pluma bien fina.", "Poné el queso sobre la prepizza y la cebolla arriba, con aceite y orégano.", "Horno fuerte 15 minutos, hasta que la cebolla dore."]),
  R("tostado", "Tostado de jamón y queso", 10, 1, "salado", ["merienda", "cena"], "fiambre", [], [pan("2 rebanadas", 0.15), jamon("2 fetas", 0.05), queso("2 fetas", 0.05, false)],
    ["Armá el sándwich con jamón y queso.", "Tostalo en una sartén con un poco de manteca, aplastándolo, o en la sandwichera."]),
  R("sandmila", "Sándwich de milanesa", 25, 2, "salado", ALM, "carne", [], [I("milanesa", "Milanesas", "2", 0.25, "kg"), pan("2 panes", 0.2), I("lechuga|tomate", "Lechuga y tomate", "a gusto", 0, "u", true, "pure|salsa|triturado"), I("mayonesa", "Mayonesa", "a gusto", 0, "u", true)],
    ["Cociná las milanesas.", "Armá el sándwich con lechuga, tomate y mayonesa. Si querés completo: jamón, queso y huevo frito."]),
  R("choripan", "Choripán", 25, 4, "salado", ["almuerzo"], "cerdo", [], [I("chorizo", "Chorizos", "4", 4), I("pan frances|pan|baguette|flauta", "Pan", "4", 0.3, "paquete", false, "rallado|lactal")],
    ["Cociná los chorizos a la parrilla o en una sartén, abiertos al medio (mariposa), 15 minutos.", "Calentá el pan y armá. Chimichurri o salsa criolla si tenés."]),
  R("panchos", "Panchos", 10, 4, "salado", ["cena"], "cerdo", [], [I("salchicha", "Salchichas", "1 paquete", 1), I("pan de pancho|pan para pancho", "Pan de pancho", "6", 1, "paquete")],
    ["Hervé las salchichas 5 minutos.", "Servilas en el pan con mostaza, ketchup o lo que te guste."]),
  R("salchipure", "Salchichas con puré", 25, 3, "salado", ["cena"], "cerdo", [], [I("salchicha", "Salchichas", "1 paquete", 1), papa(), leche("un chorro", 0.1, true), manteca()],
    ["Hacé un puré con las papas, manteca y leche.", "Calentá las salchichas hervidas o doradas en sartén. Listo."]),
  R("papascrema", "Papas a la crema", 45, 4, "salado", ["cena"], "verdura", ["veg", "horno"], [papa(), crema(), queso(), I("ajo", "Ajo", "1 diente", 0, "u", true)],
    ["Cortá las papas en rodajas finas.", "En una fuente, alterná capas de papa con crema, sal, nuez moscada y ajo.", "Queso arriba y horno medio 40 minutos."]),
  R("calabaza", "Calabaza rellena", 50, 2, "salado", ["cena"], "verdura", ["veg", "horno"], [I("calabaza|zapallo|anco", "Calabaza", "1", 1, "kg"), queso("150 g", 0.15, false), I("choclo", "Choclo", "1 lata", 1, "lata", true)],
    ["Cortá la calabaza al medio, sacale las semillas y horneala 30 minutos.", "Rellená con queso y choclo (o salsa blanca).", "Gratiná 10 minutos más."]),
  R("sopa", "Sopa de verduras", 40, 4, "salado", ["cena"], "verdura", ["veg"], [zanahoria(2), papa("2", 0.4), cebolla(), I("zapallo|calabaza", "Zapallo", "un trozo", 0.3, "kg", true), I("puerro|apio", "Puerro o apio", "1", 1, "u", true)],
    ["Cortá todas las verduras en cubos chicos.", "Rehogá la cebolla, sumá el resto y cubrí con agua o caldo.", "Cociná 30 minutos. Podés licuarla para que quede crema."]),
  R("cremazapallo", "Crema de zapallo", 35, 4, "salado", ["cena"], "verdura", ["veg"], [I("zapallo|calabaza|anco", "Zapallo", "1 kg", 1, "kg"), cebolla(), leche("un chorro", 0.2, true), rallado()],
    ["Rehogá la cebolla, sumá el zapallo en cubos y cubrí con agua o caldo.", "Cociná 20 minutos y licuá con un chorro de leche.", "Serví con queso rallado o croutones."]),
  R("cremachoclo", "Crema de choclo", 25, 3, "salado", ["cena"], "verdura", ["veg"], [I("choclo", "Choclo", "2 latas", 2, "lata"), cebolla(), leche("1/2 litro", 0.5)],
    ["Rehogá la cebolla, sumá el choclo y la leche.", "Cociná 10 minutos y licuá. Sal, pimienta y nuez moscada."]),
  R("rusa", "Ensalada rusa", 30, 4, "salado", ALM, "verdura", ["veg"], [papa("500 g", 0.5), zanahoria(2), I("arveja", "Arvejas", "1 lata", 1, "lata"), I("mayonesa", "Mayonesa", "a gusto", 0), huevo(2, true)],
    ["Hervé las papas y las zanahorias en cubos hasta que estén tiernas.", "Si querés, sumá huevos duros picados.", "Mezclá todo con las arvejas escurridas, mayonesa y sal. Mejor fría."]),
  R("ensalada", "Ensalada completa", 10, 2, "salado", ALM, "verdura", ["veg"], [I("lechuga|rucula|espinaca", "Lechuga", "1", 1), I("tomate", "Tomate", "2", 2, "u", false, "pure|salsa|triturado"), zanahoria(1, true), huevo(2, true)],
    ["Lavá y cortá todo.", "Sumá huevo duro si tenés.", "Condimentá con aceite, sal y vinagre o limón."]),
  R("cesar", "Ensalada César", 25, 2, "salado", ALM, "pollo", [], [I("lechuga", "Lechuga", "1", 1), I("pollo|pechuga", "Pollo", "1 pechuga", 0.25, "kg", false, "picad|caldo"), pan("2 rebanadas", 0.1, true), rallado()],
    ["Cociná el pollo a la plancha y cortalo en tiras.", "Tostá el pan en cubitos.", "Mezclá lechuga, pollo, pan y queso. Aderezo: mayonesa con limón, ajo y un poco de queso."]),
  R("polenta", "Polenta con salsa", 25, 4, "salado", ALM, "masa", ["veg"], [I("polenta|harina de maiz", "Polenta", "1 taza y media", 0.5, "paquete"), tomate(), queso("a gusto", 0.1), cebolla(1, true)],
    ["Hacé una salsa rehogando la cebolla y sumando el tomate con orégano. 15 minutos a fuego bajo.", "Hervé 1 litro de agua con sal y echá la polenta en lluvia sin dejar de revolver. Cociná 5 minutos.", "Serví la polenta con la salsa y queso arriba."]),

  /* ---------- desayuno y merienda ---------- */
  R("huevostost", "Huevos revueltos con tostadas", 10, 2, "salado", ["desayuno", "cena"], "huevo", ["veg"], [huevo(4), pan("4 rebanadas", 0.25), manteca()],
    ["Tostá el pan.", "Batí los huevos con sal y cocinalos a fuego bajo con manteca, revolviendo hasta que estén cremosos."]),
  R("torrejas", "Tostadas francesas", 15, 2, "dulce", DES, "dulce", ["veg"], [pan("4 rebanadas", 0.25), huevo(2), leche("1/2 taza", 0.1)],
    ["Batí los huevos con la leche, una pizca de azúcar y canela.", "Pasá las rebanadas de pan por la mezcla.", "Doralas en una sartén con manteca. Servilas con miel, azúcar o dulce de leche."]),
  R("panqueques", "Panqueques con dulce de leche", 25, 4, "dulce", DES, "dulce", ["veg"], [harina("1 taza", 0.15), huevo(2), leche("1 y 1/2 taza", 0.35), ddl("a gusto", 0, true)],
    ["Licuá o batí la harina, los huevos, la leche y una pizca de sal hasta que no queden grumos.", "Dejá reposar 10 minutos.", "En una sartén caliente con apenas de manteca, poné un cucharón y movela para que cubra el fondo. Dalo vuelta cuando se despegue.", "Rellená con dulce de leche."]),
  R("pancakesavena", "Pancakes de avena y banana", 15, 2, "dulce", DES, "dulce", ["veg"], [I("avena", "Avena", "1 taza", 0.1, "kg"), banana(1), huevo(2)],
    ["Pisá la banana y mezclala con los huevos y la avena.", "Cociná cucharadas en una sartén apenas aceitada, 2 minutos por lado.", "Con miel, fruta o yogur."]),
  R("avena", "Avena cocida con banana", 10, 1, "dulce", ["desayuno"], "dulce", ["veg"], [I("avena", "Avena", "1/2 taza", 0.05, "kg"), leche("1 taza", 0.25), banana(1)],
    ["Cociná la avena con la leche a fuego bajo 5 minutos, revolviendo.", "Serví con banana en rodajas, canela y miel."]),
  R("yogur", "Yogur con granola y fruta", 5, 1, "dulce", ["desayuno"], "dulce", ["veg"], [I("yogur|yoghurt", "Yogur", "1 pote", 1), I("granola|avena|cereal", "Granola o cereales", "un puñado", 0), I("banana|manzana|frutilla|durazno|kiwi", "Fruta", "1", 1, "u", true)],
    ["Poné el yogur en un bowl con la granola y la fruta cortada arriba."]),
  R("licuado", "Licuado de banana", 5, 2, "dulce", DES, "dulce", ["veg"], [banana(2), leche("1/2 litro", 0.5)],
    ["Licuá las bananas con la leche fría y azúcar o miel a gusto."]),
  R("frutas", "Ensalada de frutas", 15, 4, "dulce", ["merienda"], "dulce", ["veg"], [I("banana", "Banana", "2", 2), I("manzana", "Manzana", "2", 2), I("naranja", "Naranja", "2", 2, "u", true), I("frutilla|durazno|kiwi|pera|uva", "Otra fruta", "a gusto", 0, "u", true)],
    ["Cortá todas las frutas en cubos.", "Mezclalas con jugo de naranja y un poco de azúcar si querés."]),
  R("scones", "Scones", 30, 12, "dulce", ["merienda"], "dulce", ["veg", "horno"], [harina("2 tazas", 0.3), manteca("50 g", 0, false), leche("1/2 taza", 0.12), azucar("2 cucharadas", 0.03)],
    ["Mezclá la harina con polvo de hornear, el azúcar y la manteca fría hasta tener un arenado.", "Sumá la leche de a poco y uní sin amasar mucho.", "Estirá de 2 cm, cortá con un vaso y horneá 15 minutos a horno fuerte."]),
  R("bizcochuelo", "Bizcochuelo", 50, 8, "dulce", ["merienda"], "dulce", ["veg", "horno"], [huevo(4), azucar("1 taza", 0.2), harina("1 taza", 0.15)],
    ["Batí los huevos con el azúcar hasta que dupliquen el volumen y estén blancos (8 minutos).", "Sumá la harina tamizada (con polvo de hornear si no es leudante) en forma envolvente.", "Volcá en molde enmantecado y horneá a 180° 35 minutos, sin abrir el horno."]),
  R("budinbanana", "Budín de banana", 55, 8, "dulce", ["merienda"], "dulce", ["veg", "horno"], [banana(3), harina("1 y 1/2 taza", 0.2), huevo(2), azucar("1/2 taza", 0.1)],
    ["Pisá las bananas bien maduras.", "Mezclá con los huevos, el azúcar, un chorro de aceite y la harina con polvo de hornear.", "Molde de budín enmantecado, horno medio 45 minutos."]),
  R("tortamanzana", "Torta de manzana", 60, 8, "dulce", ["merienda"], "dulce", ["veg", "horno"], [I("manzana", "Manzanas", "3", 3), harina("1 y 1/2 taza", 0.2), huevo(2), azucar("1 taza", 0.2)],
    ["Batí los huevos con el azúcar, sumá un chorro de aceite y la harina con polvo de hornear.", "Agregá las manzanas en cubos o láminas.", "Horno medio 45 minutos. Canela y azúcar arriba."]),
  R("budin", "Budín de pan", 70, 6, "dulce", ["merienda"], "dulce", ["veg", "horno"], [pan("300 g", 1), leche("1/2 litro", 0.5), huevo(3), azucar("1 taza", 0.2)],
    ["Remojá el pan en la leche y deshacelo con las manos.", "Sumá los huevos, el azúcar y vainilla o ralladura si tenés.", "Acaramelá un molde, volcá la mezcla y cociná a baño María en horno medio 50 minutos."]),
  R("tortasfritas", "Tortas fritas", 40, 12, "dulce", ["merienda"], "dulce", ["veg"], [harina("500 g", 0.5), I("grasa|manteca|margarina", "Grasa o manteca", "50 g", 0)],
    ["Mezclá la harina con sal, la grasa derretida y agua tibia hasta tener una masa suave.", "Estirá, cortá círculos y hacé un agujerito en el medio.", "Freílas en aceite o grasa bien caliente. Con azúcar arriba. Ideales los días de lluvia."]),
  R("chipa", "Chipá", 35, 20, "salado", ["merienda"], "masa", ["veg", "horno"], [I("almidon de mandioca|fecula de mandioca|harina de mandioca|almidon", "Almidón de mandioca", "500 g", 0.5, "kg"), queso("250 g", 0.25, false), huevo(2), leche("un chorro", 0.1, true)],
    ["Mezclá el almidón con el queso rallado grueso, los huevos, sal y un chorro de leche hasta tener una masa que no se pegue.", "Armá bolitas.", "Horno fuerte 15 a 20 minutos."]),
  R("alfajores", "Alfajores de maicena", 60, 20, "dulce", ["merienda"], "dulce", ["veg", "horno"], [I("maicena|almidon de maiz|fecula de maiz", "Maicena", "300 g", 0.3, "kg"), harina("200 g", 0.2), manteca("200 g", 0, false), huevo(3), ddl("400 g", 0.4)],
    ["Batí la manteca con azúcar, sumá las yemas y después la maicena, la harina y polvo de hornear.", "Estirá, cortá tapitas y horneá 10 minutos (no tienen que dorarse).", "Uní de a dos con dulce de leche y pasá el borde por coco."]),
  R("pastafrola", "Pastafrola", 60, 8, "dulce", ["merienda"], "dulce", ["veg", "horno"], [harina("2 tazas", 0.3), manteca("100 g", 0, false), huevo(2), azucar("1/2 taza", 0.1), I("dulce de membrillo|dulce de batata|membrillo|batata", "Dulce de membrillo o batata", "400 g", 0.4, "kg")],
    ["Mezclá manteca, azúcar y huevos, y sumá la harina con polvo de hornear.", "Forrá una tartera, rellená con el dulce pisado con un poco de agua.", "Hacé el enrejado con tiras de masa y horneá 35 minutos."]),
  R("arrozleche", "Arroz con leche", 40, 4, "dulce", ["merienda"], "dulce", ["veg"], [arroz("1 taza", 0.25), leche("1 litro", 1), azucar("1/2 taza", 0.1)],
    ["Hervé el arroz 5 minutos en agua y escurrí.", "Sumalo a la leche con el azúcar (y cáscara de limón o canela si tenés).", "Cociná a fuego bajo 30 minutos revolviendo seguido, hasta que espese."]),
  R("flan", "Flan casero", 60, 6, "dulce", ["merienda"], "dulce", ["veg", "horno"], [huevo(4), leche("1/2 litro", 0.5), azucar("1 taza", 0.2)],
    ["Hacé un caramelo con la mitad del azúcar y cubrí una flanera.", "Batí los huevos con el resto del azúcar, sumá la leche y vainilla.", "Cociná a baño María en horno medio 45 minutos. Enfriá antes de desmoldar."]),
  R("mousse", "Mousse de chocolate", 20, 4, "dulce", ["merienda"], "dulce", ["veg"], [I("chocolate|cacao", "Chocolate", "150 g", 0.15, "kg", false, "leche chocolatada|galletitas"), crema(), huevo(2, true)],
    ["Derretí el chocolate a baño María.", "Batí la crema a medio punto y mezclala con el chocolate tibio en forma envolvente.", "Heladera 2 horas."]),
  R("postrevainillas", "Postre de vainillas", 20, 6, "dulce", ["merienda"], "dulce", ["veg"], [I("vainilla", "Vainillas", "1 paquete", 1, "paquete", false, "esencia"), ddl("400 g", 0.4), crema()],
    ["Batí la crema a punto chantilly.", "En una fuente, alterná vainillas mojadas en leche o café, dulce de leche y crema.", "Heladera 3 horas."]),
  R("chocotorta", "Chocotorta", 20, 8, "dulce", ["merienda"], "dulce", ["veg"], [I("chocolina|galletitas de chocolate", "Galletitas de chocolate", "2 paquetes", 2, "paquete"), ddl("400 g", 0.4), I("queso crema|queso blanco|queso untable", "Queso crema", "300 g", 0.3, "kg")],
    ["Mezclá el dulce de leche con el queso crema.", "Mojá las galletitas en café o leche y armá una capa en una fuente.", "Alterná capas de crema y galletitas. Terminá con crema.", "Heladera al menos 3 horas."]),
  R("gelatina", "Gelatina con fruta", 10, 4, "dulce", ["merienda"], "dulce", ["veg"], [I("gelatina", "Gelatina", "1 caja", 1), I("banana|durazno|manzana|frutilla|anana", "Fruta", "a gusto", 0, "u", true)],
    ["Disolvé la gelatina en agua caliente y sumá agua fría según la caja.", "Agregá la fruta cortada y llevá a la heladera 3 horas."]),
  /* ---------- más recetas de todos los días ---------- */
  R("carbonada", "Carbonada criolla", 70, 6, "salado", ALM, "carne", [], [carneCubos("700 g", 0.7), calabaza("500 g", 0.5), papaSola("3", 0.5), batata("2", 0.4), choclo("1 lata o 2 choclos", 1, true), I("durazno", "Duraznos en almíbar", "medio frasco", 0, "u", true)],
    ["Dorá la carne en cubos con cebolla y morrón picados.", "Sumá tomate y caldo hasta cubrir. Cociná 20 minutos.", "Agregá papa, batata y calabaza en cubos y el choclo. Cociná 20 minutos más.", "Al final, si te gusta, sumá unos duraznos en almíbar picados: es el toque clásico."]),
  R("puchero", "Puchero", 120, 6, "salado", ALM, "carne", [], [I("osobuco|falda|aguja|tapa de asado|puchero|carne", "Carne para puchero", "1 kg", 1, "kg", false, "picad|milanesa"), papaSola("4", 0.7), batata("2", 0.4), calabaza("500 g", 0.5), zanahoria(2), choclo("2 choclos", 1, true)],
    ["Poné la carne en una olla grande con agua fría y sal. Llevá a hervor y espumá.", "Sumá cebolla, puerro y apio si tenés. Cociná a fuego bajo 1 hora.", "Agregá zanahoria, choclo, papa, batata y calabaza en trozos grandes. Cociná 30 minutos.", "Serví la carne y las verduras con aceite de oliva y sal. Con el caldo hacé una sopa con fideos finos."]),
  R("humita", "Humita en olla", 40, 4, "salado", ALM, "verdura", ["veg"], [cremaChoclo("2 latas o 6 choclos", 2), cebolla(), morron(false), calabaza("300 g", 0.3), leche("1 taza", 0.25), queso("150 g", 0.15)],
    ["Rehogá la cebolla y el morrón picados.", "Sumá la calabaza en cubitos chicos y cociná 10 minutos.", "Agregá el choclo (rallado o en crema) y la leche. Cociná revolviendo 15 minutos hasta que espese.", "Sal, pimentón y una pizca de azúcar. Sumá el queso en cubos al final."]),
  R("empverdura", "Empanadas de verdura", 50, 12, "salado", ["cena"], "verdura", ["veg", "horno"], [tapasEmp(), espinaca(), cebolla(), I("salsa blanca|leche", "Leche (para salsa blanca)", "1 taza", 0.25, "L"), queso("150 g", 0.15)],
    ["Hervé la acelga o espinaca, escurrí bien y picala.", "Rehogá la cebolla, sumá la verdura y una salsa blanca espesa (manteca, harina y leche). Sal y nuez moscada. Enfriá.", "Rellená las tapas con la mezcla y un cubito de queso. Repulgá.", "Horno fuerte 15 a 20 minutos."]),
  R("emphumita", "Empanadas de humita", 50, 12, "salado", ["cena"], "verdura", ["veg", "horno"], [tapasEmp(), cremaChoclo(), cebolla(), leche("medio vaso", 0.1), queso("150 g", 0.15, true)],
    ["Rehogá la cebolla picada.", "Sumá la crema de choclo, una cucharada de harina disuelta en la leche, sal, pimienta y nuez moscada. Cociná hasta que espese. Enfriá.", "Rellená las tapas con un cubito de queso y repulgá.", "Horno fuerte 15 a 20 minutos."]),
  R("fideosatun", "Fideos con atún y tomate", 20, 3, "salado", ALM, "pasta", [], [fideos(), atun(1), tomate(), ajo(), I("aceituna", "Aceitunas", "un puñado", 0, "u", true)],
    ["Dorá ajo en aceite, sumá el tomate y cociná 10 minutos.", "Agregá el atún escurrido y las aceitunas.", "Mezclá con los fideos recién hervidos."]),
  R("macqueso", "Fideos con queso al horno (mac and cheese)", 35, 4, "salado", ["cena"], "pasta", ["veg", "horno"], [fideos("1 paquete de coditos", 1), leche("1/2 litro", 0.5), queso("250 g", 0.25, false), manteca("2 cucharadas", 0, false), harina("2 cucharadas", 0), rallar(true)],
    ["Hervé los fideos cortos.", "Salsa: manteca, harina y la leche de a poco hasta que espese. Sumá el queso y revolvé hasta que se derrita. Sal, pimienta y una cucharadita de mostaza.", "Mezclá con los fideos, poné en una fuente, pan rallado arriba y gratiná 15 minutos."]),
  R("fideosajo", "Spaghetti al ajo y aceite", 15, 2, "salado", ALM, "pasta", ["veg"], [fideos("250 g", 0.5), ajo("4 dientes", false), perejil(), I("aji molido|aji", "Ají molido", "una pizca", 0, "u", true)],
    ["Hervé los spaghetti.", "Calentá bastante aceite de oliva con ajo laminado y ají a fuego suave hasta que el ajo esté dorado.", "Mezclá con la pasta y un chorrito del agua de cocción. Perejil picado."]),
  R("fideoscalabaza", "Fideos con crema de calabaza", 30, 3, "salado", ALM, "pasta", ["veg"], [fideos(), calabaza("500 g", 0.5), crema(true), rallado()],
    ["Hervé la calabaza en cubos hasta que esté tierna.", "Procesala con un chorro de crema o leche, sal, pimienta y nuez moscada.", "Mezclá con los fideos y serví con queso rallado."]),
  R("pollolimon", "Pollo al limón", 50, 4, "salado", ALM, "pollo", ["horno"], [pollo2("1 kg de presas", 1), limon("2", 2), ajo("4 dientes", false), papa("800 g", 0.8)],
    ["Marina el pollo con jugo de limón, ajo, aceite, sal, pimienta y orégano 20 minutos (o más).", "Poné en una fuente con las papas en gajos y rodajas de limón.", "Horno fuerte 45 minutos, dándolo vuelta a la mitad."]),
  R("pollocerveza", "Pollo a la cerveza", 50, 4, "salado", ALM, "pollo", [], [pollo2("1 kg de presas", 1), cerveza(), cebolla(2), morron(), zanahoria(1, true)],
    ["Dorá las presas en una olla con aceite. Reservá.", "Rehogá la cebolla, el morrón y la zanahoria.", "Volvé el pollo, sumá la cerveza y cociná tapado a fuego bajo 35 minutos. Destapá al final para espesar."]),
  R("portuguesa", "Pollo a la portuguesa", 50, 4, "salado", ALM, "pollo", [], [pollo2(), tomate(), cebolla(2), morron(false), I("aceituna", "Aceitunas", "un puñado", 0, "u", true)],
    ["Dorá el pollo en presas.", "Sumá cebolla y morrón en tiras y rehogá.", "Agregá el tomate, laurel, pimentón y un poco de agua. Cociná tapado 30 minutos.", "Aceitunas al final. Va bien con arroz o papas."]),
  R("muslosmiel", "Muslos al horno con miel y mostaza", 50, 4, "salado", ["cena"], "pollo", ["horno"], [I("muslo|pata muslo|pollo", "Muslos de pollo", "8", 1.2, "kg", false, "picad|nugget"), miel(), mostaza(false), batata("2", 0.5)],
    ["Mezclá 2 cucharadas de miel, 2 de mostaza, aceite, sal y pimienta.", "Pintá los muslos y poné en una fuente con las batatas en gajos.", "Horno fuerte 40 minutos, pintando de nuevo a la mitad."]),
  R("nuggets", "Nuggets de pollo caseros", 30, 4, "salado", ["cena"], "pollo", [], [pechuga("600 g", 0.6), huevo(2), rallar(), I("copos de maiz|corn flakes|cereal", "Copos de maíz", "1 taza", 0, "u", true)],
    ["Cortá las pechugas en bocados.", "Pasalos por huevo batido con sal y después por pan rallado (mezclado con copos de maíz molidos para que queden más crocantes).", "Horno fuerte 20 minutos, dándolos vuelta, o fritos."]),
  R("wokcarne", "Wok de carne y vegetales", 25, 3, "salado", ["cena"], "carne", [], [I("lomo|cuadril|nalga|bife|carne para wok|peceto|carne", "Carne tierna en tiras", "500 g", 0.5, "kg", false, "picad|milanesa"), morron(false), zanahoria(1), I("salsa de soja|soja", "Salsa de soja", "3 cucharadas", 0), verdeo(), arroz("1 taza", 0.25)],
    ["Hervé el arroz.", "Cortá todo en tiras finas. Calentá el wok o una sartén grande hasta que humee.", "Saltá la carne en tandas, 2 minutos, y reservá.", "Saltá las verduras, volvé la carne, sumá la soja y una cucharadita de azúcar. Verdeo arriba y serví con el arroz."]),
  R("cacerola", "Carne a la cacerola", 120, 6, "salado", ALM, "carne", [], [carneHorno("1,2 kg", 1.2), cebolla(2), zanahoria(2), vino("1 vaso", 0.25, true), papa("800 g", 0.8)],
    ["Atá la carne si es una pieza entera y sellala bien en una cacerola.", "Sumá cebolla y zanahoria, rehogá y agregá el vino y agua o caldo hasta cubrir la mitad.", "Cociná tapado a fuego bajo 1 hora y media, dándola vuelta.", "Sumá las papas la última media hora. Cortá en fetas y serví con la salsa."]),
  R("peceto", "Peceto al horno con papas", 90, 6, "salado", ALM, "carne", ["horno"], [I("peceto|colita de cuadril|cuadril", "Peceto", "1,2 kg", 1.2, "kg"), papa("1 kg", 1), ajo("4 dientes", false), I("romero|tomillo", "Romero", "unas ramitas", 0, "u", true)],
    ["Untá el peceto con aceite, ajo picado, sal, pimienta y romero.", "Sellalo en una sartén muy caliente de todos lados.", "Pasalo a una fuente con las papas y horneá a 180° 50 minutos.", "Reposá 10 minutos antes de cortar en fetas finas."]),
  R("vacio", "Vacío al horno", 150, 6, "salado", ALM, "carne", ["horno"], [I("vacio", "Vacío", "1,5 kg", 1.5, "kg"), papa("1 kg", 1), I("chimichurri", "Chimichurri", "a gusto", 0, "u", true)],
    ["Salá el vacío y envolvelo en papel aluminio con la grasa hacia arriba.", "Horno bajo (160°) 2 horas.", "Abrí el papel, poné las papas alrededor, subí el horno y dorá 30 minutos más.", "Serví con chimichurri."]),
  R("costillitas", "Costillitas de cerdo a la barbacoa", 90, 4, "salado", ["cena"], "cerdo", ["horno"], [I("costilla de cerdo|costillita|pechito|cerdo", "Costillitas de cerdo", "1,2 kg", 1.2, "kg", false, "picad|salchicha|chorizo|jamon"), I("barbacoa|ketchup", "Salsa barbacoa o ketchup", "1 taza", 0), miel("2 cucharadas", true), papa("800 g", 0.8)],
    ["Salpimentá las costillitas, tapalas con aluminio y horneá a 160° 1 hora.", "Mezclá la barbacoa con la miel (o ketchup, miel, soja y pimentón).", "Destapá, pintá con la salsa y horneá fuerte 20 minutos más, pintando otra vez. Papas al horno al costado."]),
  R("bondiolahorno", "Bondiola al horno con batatas", 100, 6, "salado", ALM, "cerdo", ["horno"], [cerdo("1,2 kg", 1.2, "Bondiola"), batata("1 kg", 1), mostaza(), I("naranja", "Naranja", "1", 1, "u", true)],
    ["Untá la bondiola con mostaza, ajo, sal, pimienta y jugo de naranja.", "Horneá tapada a 170° 1 hora.", "Destapá, sumá las batatas en trozos y cociná 40 minutos más hasta que esté dorada."]),
  R("chuletas", "Chuletas de cerdo con puré de manzana", 30, 4, "salado", ["cena"], "cerdo", [], [cerdo("4 chuletas", 0.9, "Chuletas de cerdo"), manzana(3), manteca(), papa("600 g", 0.6)],
    ["Hervé las papas para un puré.", "Cociná las manzanas peladas en cubos con manteca y un poco de agua hasta que se deshagan.", "Cociná las chuletas en una plancha bien caliente 4 minutos por lado.", "Serví con el puré de papa y el de manzana."]),
  R("pastelpollo", "Pastel de pollo y choclo", 60, 6, "salado", ["cena"], "pollo", ["horno"], [pollo2("700 g", 0.7), cremaChoclo("2 latas", 2), cebolla(), morron(), huevo(2, true)],
    ["Hervé o cociná el pollo y desmenuzalo.", "Rehogá cebolla y morrón, sumá el pollo, condimentá y poné en una fuente. Huevo duro picado arriba si tenés.", "Cubrí con la crema de choclo espesada con una cucharada de harina.", "Espolvoreá azúcar y gratiná 20 minutos."]),
  R("pancarne", "Pan de carne", 60, 6, "salado", ["cena"], "carne", ["horno"], [picada("1 kg", 1), huevo(2), rallar(), cebolla(), I("jamon|queso|huevo", "Jamón, queso o huevo duro (relleno)", "a gusto", 0, "u", true)],
    ["Mezclá la carne con los huevos, pan rallado, cebolla rallada, ajo, perejil, sal y pimienta.", "Extendé sobre un papel, poné el relleno y enrollá.", "Horno medio 45 minutos. Va frío o caliente."]),
  R("ninosenvueltos", "Niños envueltos de repollo", 75, 4, "salado", ALM, "carne", [], [repollo(), picada(), arroz("media taza", 0.12), tomate(), cebolla()],
    ["Separá las hojas de repollo y hervilas 3 minutos para que se ablanden.", "Mezclá la carne con el arroz crudo, cebolla picada, sal y pimentón.", "Poné una cucharada en cada hoja y enrollá cerrando los costados.", "Acomodalos en una olla, cubrí con salsa de tomate y agua, y cociná tapado 45 minutos."]),
  R("hamburpollo", "Hamburguesas de pollo", 25, 4, "salado", ["cena"], "pollo", [], [I("pollo picado|picada de pollo|pechuga|pollo", "Pollo picado", "600 g", 0.6, "kg", false, "nugget|hamburguesa"), huevo(1), rallar(), I("pan de hamburguesa|pan de pancho|pan", "Pan de hamburguesa", "4", 1, "paquete", true)],
    ["Si usás pechuga, procesala. Mezclá con huevo, pan rallado, ajo, verdeo y sal.", "Armá medallones y cocinálos en plancha 5 minutos por lado.", "Servilos en pan con lechuga, tomate y la salsa que quieras."]),
  R("croqpollo", "Croquetas de pollo", 50, 4, "salado", ["cena"], "pollo", [], [pollo2("400 g cocido", 0.4), leche("1/2 litro", 0.5), harina("6 cucharadas", 0.06), huevo(2), rallar()],
    ["Hacé una salsa blanca muy espesa con manteca, la harina y la leche.", "Sumá el pollo desmenuzado, sal y nuez moscada. Enfriá en la heladera 1 hora.", "Formá croquetas, pasalas por huevo y pan rallado y freílas hasta que estén doradas."]),
  R("pescadoplancha", "Pescado a la plancha con ensalada", 20, 2, "salado", ["cena"], "pescado", [], [pescadoBlanco("400 g", 0.4), limon(), lechuga(), tomateFresco(2, true)],
    ["Secá el pescado y salpimentalo.", "Cociná en plancha o sartén caliente con un hilo de aceite, 3 minutos por lado.", "Serví con limón y una ensalada fresca."]),
  R("tartaatun", "Tarta de atún", 50, 6, "salado", ["cena"], "masa", ["horno"], [tapasTarta(), atun(2), cebolla(), morron(), huevo(3)],
    ["Rehogá cebolla y morrón picados.", "Mezclalos con el atún, los huevos batidos, sal y pimienta.", "Rellená la tarta, tapala con la otra masa y horneá 35 minutos."]),
  R("tartacalabaza", "Tarta de calabaza y queso", 60, 6, "salado", ["cena"], "masa", ["veg", "horno"], [tapasTarta(), calabaza("1 kg", 1), cebolla(), huevo(2), queso("200 g", 0.2, false)],
    ["Hervé o asá la calabaza y hacela puré.", "Mezclala con cebolla rehogada, los huevos, el queso en cubos, sal y nuez moscada.", "Rellená la masa y horneá 35 minutos."]),
  R("tartapuerro", "Tarta de puerros", 55, 6, "salado", ["cena"], "masa", ["veg", "horno"], [tapasTarta(), puerro(), huevo(3), crema(true), queso("150 g", 0.15)],
    ["Cortá los puerros en rodajas (la parte blanca y verde clara) y rehogalos en manteca 10 minutos.", "Mezclá con los huevos, crema o leche, el queso, sal y nuez moscada.", "Rellená la masa y horneá 30 minutos."]),
  R("pizzaverduras", "Pizza de verduras grilladas", 35, 4, "salado", ["cena"], "verdura", ["veg", "horno"], [masaPizza(), berenjena(1), zapallito(1), morron(false), mozza("250 g", 0.25), tomate()],
    ["Cortá berenjena, zapallito y morrón en láminas y grillalos con aceite y sal.", "Pintá la prepizza con salsa, cubrí con mozzarella y las verduras.", "Horno fuerte 12 minutos."]),
  R("faina", "Fainá", 30, 6, "salado", ["cena"], "legumbre", ["veg", "horno"], [I("harina de garbanzo", "Harina de garbanzos", "250 g", 0.25, "kg")],
    ["Mezclá la harina con 500 ml de agua, sal y pimienta. Dejá reposar 1 hora (o más).", "Calentá una pizzera con bastante aceite en horno fuerte.", "Volcá la mezcla (tiene que quedar finita) y horneá 15 minutos hasta que esté dorada. Ideal con pizza."]),
  R("calzone", "Calzone de jamón y queso", 35, 2, "salado", ["cena"], "fiambre", ["horno"], [masaPizza(), jamon("150 g", 0.15), mozza("200 g", 0.2), tomate(true)],
    ["Sobre media prepizza (o masa de pizza estirada) poné salsa, jamón y mozzarella.", "Doblá la otra mitad encima y cerrá bien los bordes.", "Pintá con huevo o aceite y horneá a fuego fuerte 15 minutos."]),
  R("sandbondiola", "Sándwich de bondiola", 25, 2, "salado", ["cena"], "cerdo", [], [cerdo("400 g en fetas", 0.4, "Bondiola"), pan("2 panes", 0), lechuga(true), tomateFresco(1, true), I("barbacoa|mayonesa|chimichurri", "Salsa a gusto", "a gusto", 0, "u", true)],
    ["Cociná las fetas de bondiola en una plancha bien caliente, 3 minutos por lado. Sal y pimienta.", "Abrí el pan y tostalo.", "Armá con lechuga, tomate, la bondiola y la salsa que más te guste."]),
  R("wraps", "Wraps de pollo", 20, 2, "salado", ["almuerzo", "cena"], "pollo", [], [tortillas(), pechuga("300 g", 0.3), lechuga(), tomateFresco(1), queso("100 g", 0.1, true), mayo()],
    ["Cociná el pollo en tiras con sal, pimentón y comino.", "Calentá las tortillas en una sartén.", "Rellená con lechuga, tomate, queso y pollo. Una salsa de yogur o mayonesa y enrollá."]),
  R("ensaladalentejas", "Ensalada de lentejas", 30, 3, "salado", ALM, "legumbre", ["veg"], [lentejas(), tomateFresco(2), cebolla(1), morron(), I("queso feta|queso fresco|queso", "Queso fresco", "100 g", 0.1, "kg", true)],
    ["Hervé las lentejas 20 minutos (que queden enteras) o usá de lata. Enfriá.", "Mezclalas con tomate, cebolla morada y morrón en cubitos.", "Aliño: aceite, limón o vinagre, sal y comino. Queso en cubos arriba."]),
  R("ensaladagarbanzos", "Ensalada de garbanzos", 15, 3, "salado", ALM, "legumbre", ["veg"], [garbanzos(), tomateFresco(2), I("pepino", "Pepino", "1", 1, "u", true), cebolla(1, true), perejil()],
    ["Escurrí y enjuagá los garbanzos.", "Mezclalos con tomate, pepino y cebolla en cubitos.", "Aliño: aceite de oliva, limón, sal, comino y perejil picado."]),
  R("papahuevo", "Ensalada tibia de papa y huevo", 30, 3, "salado", ALM, "huevo", ["veg"], [papa("800 g", 0.8), huevo(3), verdeo(), mayo()],
    ["Hervé las papas en cubos y los huevos 10 minutos.", "Mezclá las papas tibias con los huevos picados, verdeo, aceite o mayonesa, sal y pimienta."]),
  R("guacamole", "Guacamole con nachos", 10, 3, "salado", ["merienda"], "verdura", ["veg"], [palta(2), tomateFresco(1), cebolla(1, true), limon(), I("nachos|tostadas|totopos", "Nachos o tostadas", "1 bolsa", 1, "u", true)],
    ["Pisá las paltas con jugo de limón y sal.", "Sumá tomate y cebolla picados chiquitos, y cilantro o ají si te gusta.", "Serví enseguida con nachos o tostadas."]),
  R("tostadapalta", "Tostadas con palta y huevo", 10, 2, "salado", DES, "huevo", ["veg"], [pan("2 rodajas", 0), palta(1), huevo(2), limon("medio", 0.5, true)],
    ["Tostá el pan.", "Pisá la palta con sal, pimienta y unas gotas de limón.", "Cociná los huevos fritos o revueltos.", "Armá: pan, palta y huevo arriba. Semillas o ají molido si tenés."]),
  R("revueltohongos", "Revuelto de hongos", 15, 2, "salado", ["cena"], "huevo", ["veg"], [hongos("200 g", 0.2), huevo(4), ajo("1 diente"), perejil()],
    ["Saltá los hongos en manteca con ajo hasta que estén dorados.", "Sumá los huevos batidos con sal y revolvé a fuego bajo hasta que estén cremosos.", "Perejil arriba."]),
  R("frittata", "Frittata de verduras al horno", 35, 4, "salado", ["cena"], "huevo", ["veg", "horno"], [huevo(6), zapallito(1), morron(), cebolla(), queso("100 g", 0.1)],
    ["Rehogá cebolla, morrón y zapallito en cubitos en una sartén que vaya al horno.", "Batí los huevos con sal, pimienta y el queso, y volcá sobre las verduras.", "Cociná 3 minutos al fuego y terminá en el horno 15 minutos hasta que esté firme."]),
  R("papasrusticas", "Papas rústicas al horno", 45, 4, "salado", ALM, "verdura", ["veg", "horno"], [papa(), I("romero|pimenton|oregano", "Romero o pimentón", "a gusto", 0, "u", true)],
    ["Lavá las papas y cortalas en gajos con cáscara.", "Condimentá con aceite, sal, pimienta y romero o pimentón.", "Horno fuerte 40 minutos, dándolas vuelta a la mitad."]),
  R("papasfritas", "Papas fritas caseras", 30, 3, "salado", ALM, "verdura", ["veg"], [papa()],
    ["Cortá las papas en bastones y dejalas 15 minutos en agua fría. Secalas muy bien.", "Freílas primero en aceite no tan caliente 5 minutos, sacalas.", "Subí el fuego y freílas otra vez hasta que estén doradas y crocantes. Sal al final."]),
  R("batatasfritas", "Bastones de batata al horno", 40, 3, "salado", ALM, "verdura", ["veg", "horno"], [batata()],
    ["Cortá las batatas en bastones.", "Condimentá con aceite, sal, pimentón y una pizca de azúcar.", "Horno fuerte 30 minutos, separadas en la placa para que queden crocantes."]),
  R("purecalabaza", "Puré de calabaza", 30, 4, "salado", ALM, "verdura", ["veg"], [calabaza(), manteca(), rallado()],
    ["Hervé la calabaza en trozos o asala en el horno.", "Pisala con manteca, sal, pimienta y nuez moscada.", "Queso rallado arriba si te gusta."]),
  R("garbanzosguiso", "Guiso de garbanzos", 50, 4, "salado", ALM, "legumbre", [], [garbanzos("2 latas", 2), salchicha(), papaSola("2", 0.4), tomate(), cebolla()],
    ["Dorá el chorizo en rodajas, sacalo y rehogá la cebolla en su grasa.", "Sumá tomate, pimentón y caldo. Agregá las papas en cubos y cociná 15 minutos.", "Sumá los garbanzos y el chorizo y cociná 10 minutos más."]),
  R("polentagratin", "Polenta gratinada con queso", 30, 4, "salado", ["cena"], "verdura", ["veg", "horno"], [I("polenta|harina de maiz", "Polenta", "1 taza y media", 0.25, "kg"), leche("1/2 litro", 0.5, true), queso("200 g", 0.2, false), tomate(true)],
    ["Hervé agua y leche (1 litro en total) con sal, sumá la polenta en lluvia y revolvé 5 minutos.", "Volcala en una fuente, cubrí con salsa y queso.", "Gratiná 15 minutos."]),
  R("cremapuerro", "Crema de puerros y papa", 40, 4, "salado", ["cena"], "verdura", ["veg"], [puerro(), papaSola("3", 0.5), crema(true), manteca()],
    ["Rehogá los puerros en rodajas en manteca.", "Sumá las papas en cubos y caldo hasta cubrir. Cociná 20 minutos.", "Procesá y sumá un chorro de crema o leche. Sal, pimienta y nuez moscada."]),
  R("sopapollo", "Sopa de pollo con fideos", 50, 4, "salado", ["cena"], "pollo", [], [pollo2("2 presas", 0.5), zanahoria(2), I("fideo cabello|fideos finos|municion|letras|fideo", "Fideos de sopa", "1 taza", 0.25, "paquete"), cebolla(), I("apio", "Apio", "1 rama", 0, "u", true)],
    ["Poné el pollo con cebolla, zanahoria y apio en una olla con 2 litros de agua y sal. Cociná 35 minutos.", "Sacá el pollo, desmenuzalo y volvelo a la olla.", "Sumá los fideos y cociná según el paquete."]),
  R("minestrone", "Minestrone", 50, 6, "salado", ["cena"], "verdura", ["veg"], [zanahoria(2), zapallito(1), papaSola("2", 0.4), I("poroto|lenteja|garbanzo", "Porotos (de lata)", "1 lata", 1, "lata", true), fideos("1 taza de fideos cortos", 0.2), tomate(true)],
    ["Rehogá cebolla y zanahoria picadas.", "Sumá papa y zapallito en cubitos, tomate y caldo. Cociná 20 minutos.", "Agregá los porotos y los fideos cortos, y cociná hasta que estén a punto. Queso rallado al servir."]),
  /* ---------- dulces y meriendas ---------- */
  R("brownies", "Brownies", 40, 12, "dulce", ["merienda"], "dulce", ["veg", "horno"], [chocolate("200 g", 0.2), manteca("150 g", 0, false), huevo(3), azucar("200 g", 0.2), harina("100 g", 0.1), nueces()],
    ["Derretí el chocolate con la manteca.", "Batí los huevos con el azúcar, sumá el chocolate, después la harina y las nueces picadas.", "Volcá en un molde con papel y horneá a 180° 20 minutos: tiene que quedar húmedo en el centro."]),
  R("galleavena", "Galletitas de avena", 30, 20, "dulce", ["merienda"], "dulce", ["veg", "horno"], [avena("2 tazas", 0.2), manteca("100 g", 0, false), azucar("100 g", 0.1), huevo(1), harina("1 taza", 0.12), I("pasas|chips de chocolate|chocolate", "Pasas o chips de chocolate", "un puñado", 0, "u", true)],
    ["Batí la manteca con el azúcar, sumá el huevo.", "Agregá la avena, la harina, una pizca de sal, polvo de hornear y las pasas o chips.", "Armá bolitas, aplastalas en una placa y horneá 12 minutos."]),
  R("muffins", "Muffins de chocolate", 35, 12, "dulce", ["merienda"], "dulce", ["veg", "horno"], [harina("250 g", 0.25), I("cacao", "Cacao", "3 cucharadas", 0), azucar("150 g", 0.15), huevo(2), leche("1 taza", 0.25), polvoHornear()],
    ["Mezclá los secos: harina, cacao, azúcar y polvo de hornear.", "Aparte, batí huevos, leche y medio vaso de aceite.", "Uní todo sin batir de más, repartí en pirotines y horneá a 180° 20 minutos."]),
  R("tortazanahoria", "Torta de zanahoria", 60, 10, "dulce", ["merienda"], "dulce", ["veg", "horno"], [zanahoria(3), harina("250 g", 0.25), azucar("200 g", 0.2), huevo(3), nueces(), quesoCrema("200 g", 0.2)],
    ["Batí los huevos con el azúcar y un vaso de aceite.", "Sumá las zanahorias ralladas, la harina con polvo de hornear, canela y nueces.", "Horneá a 180° 40 minutos.", "Cubrí con queso crema batido con un poco de azúcar impalpable."]),
  R("tortachocolate", "Torta de chocolate húmeda", 55, 10, "dulce", ["merienda"], "dulce", ["veg", "horno"], [harina("250 g", 0.25), I("cacao", "Cacao", "50 g", 0), azucar("250 g", 0.25), huevo(2), leche("1 taza", 0.25), polvoHornear()],
    ["Mezclá harina, cacao, azúcar, polvo de hornear y una pizca de sal.", "Sumá huevos, leche, medio vaso de aceite y al final una taza de agua caliente o café.", "Horneá a 180° 40 minutos. Cubrila con chocolate derretido con crema si querés."]),
  R("budinlimon", "Budín de limón", 55, 8, "dulce", ["merienda"], "dulce", ["veg", "horno"], [limon("2", 2), harina("250 g", 0.25), azucar("200 g", 0.2), huevo(3), yogur("1 pote", 1, true), polvoHornear()],
    ["Batí los huevos con el azúcar y la ralladura de los limones.", "Sumá el yogur, medio vaso de aceite y la harina con polvo de hornear.", "Horneá a 180° 45 minutos.", "Glaseado: jugo de limón con azúcar impalpable, por arriba cuando esté frío."]),
  R("pancasero", "Pan casero", 150, 8, "salado", DES, "masa", ["veg", "horno"], [harina("1 kg", 1), levadura()],
    ["Disolvé la levadura en agua tibia con una cucharadita de azúcar.", "Mezclá con la harina, 2 cucharaditas de sal y agua tibia de a poco (unos 600 ml) hasta tener una masa suave. Amasá 10 minutos.", "Dejá levar tapado 1 hora, hasta que duplique.", "Armá los panes, dejá levar 30 minutos más y horneá fuerte 30 minutos."]),
  R("granola", "Granola casera", 35, 10, "dulce", DES, "dulce", ["veg", "horno"], [avena("3 tazas", 0.3), miel("4 cucharadas"), nueces(false), I("pasas|coco rallado|semillas", "Pasas o semillas", "a gusto", 0, "u", true)],
    ["Mezclá la avena con los frutos secos picados, la miel y 3 cucharadas de aceite.", "Extendé en una placa y horneá a 160° 20 minutos, revolviendo cada 5.", "Enfriá, sumá las pasas o semillas y guardá en un frasco."]),
  R("overnight", "Avena remojada de la noche", 5, 1, "dulce", DES, "dulce", ["veg"], [avena("media taza", 0.05), leche("media taza", 0.12), yogur("2 cucharadas", 0, true), banana(1)],
    ["En un frasco mezclá la avena con la leche, el yogur y una cucharadita de miel.", "Heladera toda la noche.", "A la mañana sumá banana en rodajas y lo que tengas: frutos secos, canela, frutillas."]),
  R("licuadofrutilla", "Licuado de frutilla", 5, 2, "dulce", DES, "dulce", ["veg"], [I("frutilla", "Frutillas", "250 g", 0.25, "kg", false, "mermelada|yogur"), leche("2 vasos", 0.5)],
    ["Lavá las frutillas y sacales las hojas.", "Licuá con la leche, azúcar o miel a gusto y hielo."]),
  R("panqmanzana", "Panqueques de manzana", 30, 4, "dulce", ["merienda"], "dulce", ["veg"], [harina("1 taza", 0.12), leche("1 taza y media", 0.4), huevo(2), manzana(2)],
    ["Licuá harina, leche, huevos y una pizca de sal. Reposá 10 minutos.", "Cociná las manzanas en láminas con manteca, azúcar y canela.", "Hacé los panqueques finos, rellenálos con las manzanas y espolvoreá azúcar."]),
  R("tartaricota", "Tarta de ricota", 60, 8, "dulce", ["merienda"], "dulce", ["veg", "horno"], [tapasTarta(), ricota("500 g", 0.5), huevo(3), azucar("150 g", 0.15), limon("1", 1, true)],
    ["Forrá una tartera con la masa.", "Mezclá la ricota con los huevos, el azúcar, ralladura de limón y esencia de vainilla.", "Rellená y horneá a 180° 40 minutos. Se come fría."]),
  R("churros", "Churros", 35, 4, "dulce", ["merienda"], "dulce", ["veg"], [harina("250 g", 0.25), azucar("para espolvorear", 0), ddl("para rellenar", 0, true)],
    ["Hervé 250 ml de agua con sal y una cucharada de aceite. Sumá la harina de golpe y revolvé hasta formar una masa.", "Pasala a una manga con pico de estrella.", "Freí tiras en aceite bien caliente hasta que estén doradas.", "Pasalos por azúcar. Si querés, rellenalos con dulce de leche."]),
  R("crumble", "Crumble de manzana", 45, 6, "dulce", ["merienda"], "dulce", ["veg", "horno"], [manzana(5), harina("150 g", 0.15), manteca("100 g", 0, false), azucar("120 g", 0.12), avena("media taza", 0.05)],
    ["Cortá las manzanas en cubos, mezclalas con canela y 2 cucharadas de azúcar y poné en una fuente.", "Arenado: frotá con los dedos la harina, la manteca fría, el resto del azúcar y la avena hasta formar migas.", "Cubrí las manzanas y horneá a 180° 35 minutos, hasta que esté dorado. Tibio con helado."]),
  R("vigilante", "Queso y dulce", 5, 2, "dulce", ["merienda"], "dulce", ["veg"], [I("queso fresco|port salut|queso cremoso|queso", "Queso fresco", "200 g", 0.2, "kg", false, "rallado|crema|untable"), I("dulce de membrillo|dulce de batata|membrillo", "Dulce de membrillo o batata", "200 g", 0.2, "kg")],
    ["Cortá el queso y el dulce en porciones del mismo tamaño y serví juntos."]),
  /* ---------- para lucirse (gourmet) ---------- */
  R("lomomalbec", "Lomo al malbec con puré de batata", 50, 4, "salado", ["cena"], "carne", ["gourmet"], [lomo(), vino("1 copa", 0.25), batata("800 g", 0.8), manteca("2 cucharadas", 0, false), cebolla(1, true)],
    ["Hervé las batatas peladas en agua con sal hasta que estén tiernas. Pisalas con una cucharada de manteca, sal y pimienta.", "Secá bien el lomo, salpimentalo y sellalo en una sartén muy caliente con un hilo de aceite: 3 o 4 minutos por lado para que quede jugoso. Dejalo reposar 5 minutos tapado con papel aluminio.", "En la misma sartén rehogá cebolla picada fina, sumá el vino y raspá el fondo. Reducí a la mitad, apagá el fuego y agregá una cucharada de manteca fría para que la salsa brille.", "Cortá el lomo en medallones gruesos y serví sobre el puré con la salsa por encima."]),
  R("ojobife", "Ojo de bife con manteca de hierbas", 25, 2, "salado", ["cena"], "carne", ["gourmet"], [I("ojo de bife|bife ancho|entrecot|bife de chorizo", "Ojo de bife", "2 bifes gruesos", 0.7, "kg"), manteca("50 g", 0, false), ajo("1 diente"), perejil(), I("romero|tomillo", "Romero o tomillo", "unas ramitas", 0, "u", true)],
    ["Sacá la carne de la heladera 30 minutos antes. Mezclá la manteca blanda con ajo y perejil picados, sal y pimienta; armá un cilindro en film y llevalo al freezer.", "Calentá una plancha o sartén de hierro hasta que humee. Cociná los bifes 4 minutos sin moverlos, dalos vuelta y sumá las ramitas de romero.", "Cociná 3 o 4 minutos más para jugoso. Reposá 5 minutos.", "Serví con una rodaja de manteca de hierbas arriba para que se derrita sobre la carne."]),
  R("bondiolacerveza", "Bondiola braseada a la cerveza", 180, 6, "salado", ["almuerzo", "cena"], "cerdo", ["gourmet", "horno"], [cerdo("1,5 kg", 1.5, "Bondiola"), cerveza("1 litro", 1), cebolla(2), miel("3 cucharadas", true), mostaza()],
    ["Salpimentá la bondiola y sellala en una olla que vaya al horno, dorándola bien de todos lados.", "Sacala, rehogá la cebolla en pluma en la misma olla hasta que esté dorada.", "Volvé a poner la carne, sumá la cerveza, la miel y la mostaza. Tapá y llevá a horno bajo (160°) 2 horas y media, dándola vuelta a mitad de cocción.", "Destapá, subí el horno y reducí la salsa 20 minutos. Desmechala o cortala en fetas gruesas. Va perfecta con puré o en pan."]),
  R("matambrecerdo", "Matambre de cerdo a la mostaza y miel", 70, 4, "salado", ["cena"], "cerdo", ["gourmet", "horno"], [cerdo("1 kg", 1, "Matambre de cerdo"), mostaza(false), miel(), limon("1", 1, true), papa("800 g", 0.8)],
    ["Mezclá 3 cucharadas de mostaza con 2 de miel, jugo de limón, sal y pimienta.", "Poné el matambre en una fuente con las papas en gajos alrededor. Pincelá la carne con la mitad de la salsa.", "Horno fuerte 25 minutos, dalo vuelta, pincelá con el resto y cociná 25 minutos más hasta que esté dorado y tierno."]),
  R("osobuco", "Osobuco braseado con gremolata", 150, 4, "salado", ["almuerzo", "cena"], "carne", ["gourmet"], [I("osobuco", "Osobuco", "4 rodajas", 1.2, "kg"), vinoBlanco(), zanahoria(2), cebolla(), tomate(true), limon("1", 1, true), perejil()],
    ["Pasá el osobuco por harina y sellalo en una olla con aceite. Reservá.", "Rehogá cebolla y zanahoria picadas chiquitas. Sumá el vino y dejá evaporar el alcohol.", "Volvé a poner la carne, agregá el tomate y caldo hasta casi cubrir. Cociná tapado a fuego mínimo 2 horas, hasta que se separe del hueso.", "Gremolata: picá muy fino perejil, ajo y ralladura de limón. Espolvoreá arriba al servir. Ideal con risotto o polenta."]),
  R("bourguignon", "Carne al vino tinto con hongos", 150, 6, "salado", ["almuerzo", "cena"], "carne", ["gourmet"], [carneCubos("1 kg", 1), vino("1 botella", 0.75), hongos(), panceta("150 g", 0.15, true), zanahoria(2), cebolla()],
    ["Dorá la panceta en cubitos en una olla. Sacala y en esa grasa sellá la carne en tandas, bien dorada.", "Rehogá cebolla y zanahoria, sumá una cucharada de harina y revolvé un minuto.", "Volvé a poner la carne y la panceta, cubrí con el vino, sumá laurel y tomillo si tenés. Cociná tapado a fuego bajo 2 horas.", "Saltá los hongos en manteca hasta que estén dorados y sumalos los últimos 15 minutos. Servilo con puré."]),
  R("entrana", "Entraña con chimichurri y papas rústicas", 50, 4, "salado", ["cena"], "carne", ["gourmet", "horno"], [I("entrana|vacio|bife de chorizo|matambre", "Entraña", "1 kg", 1, "kg"), papa("1 kg", 1), perejil(false), ajo("3 dientes", false), I("vinagre", "Vinagre", "un chorro", 0, "u", true)],
    ["Papas: cortalas en gajos con cáscara, condimentá con aceite, sal y pimentón y horneá a fuego fuerte 40 minutos.", "Chimichurri: picá perejil y ajo, sumá orégano, ají molido, sal, un chorro de vinagre y aceite hasta cubrir. Dejá reposar.", "Cociná la entraña en una plancha bien caliente 4 o 5 minutos por lado. Reposá y cortala en contra de la fibra.", "Serví con el chimichurri por encima y las papas al costado."]),
  R("carpaccio", "Carpaccio de lomo con rúcula y parmesano", 20, 4, "salado", ["cena"], "carne", ["gourmet"], [I("lomo|peceto", "Lomo", "300 g", 0.3, "kg", false, "bola de lomo|cerdo"), rucula(), parmesano(), limon(), I("alcaparra", "Alcaparras", "1 cucharada", 0, "u", true)],
    ["Envolvé la carne en film bien apretada y llevala 1 hora al freezer para que se pueda cortar muy fino.", "Cortala en láminas lo más finas posible y acomodalas en platos sin superponer.", "Rociá con limón, aceite de oliva, sal gruesa y pimienta.", "Terminá con rúcula, lascas de parmesano y alcaparras. Servilo enseguida."]),
  R("vitel", "Vitel toné", 90, 8, "salado", ["cena"], "carne", ["gourmet"], [I("peceto|colita de cuadril|nalga", "Peceto", "1 kg", 1, "kg"), atun(1), mayo(false), huevo(2), I("alcaparra", "Alcaparras", "1 cucharada", 0, "u", true), crema(true)],
    ["Hervé el peceto en agua con cebolla, zanahoria, laurel y sal, a fuego suave 1 hora. Dejalo enfriar en su caldo.", "Hervé los huevos 10 minutos.", "Procesá el atún, las yemas, la mayonesa y un chorro del caldo hasta lograr una salsa cremosa (si querés, sumá crema).", "Cortá la carne bien fina, cubrí con la salsa y decorá con alcaparras. Heladera unas horas antes de servir."]),
  R("pollorelleno", "Arrollado de pollo con jamón crudo y queso", 60, 4, "salado", ["cena"], "pollo", ["gourmet", "horno"], [pechuga("4 pechugas", 0.8), jamonCrudo(), mozza("150 g", 0.15), I("espinaca|rucula|albahaca", "Espinaca o rúcula", "un puñado", 0, "u", true), vinoBlanco("medio vaso", 0.1, true)],
    ["Abrí las pechugas en mariposa y aplanalas entre dos films con un palo o una botella.", "Salpimentá, cubrí con jamón crudo, queso y hojas verdes. Enrollá apretado y atá con hilo o palillos.", "Dorálos en una sartén y terminá en el horno 25 minutos, mojando con el vino.", "Cortá en rodajas y rociá con el jugo de la fuente."]),
  R("pollocurry", "Pollo al curry con leche de coco", 40, 4, "salado", ["cena"], "pollo", ["gourmet"], [pechuga("700 g", 0.7), coco(), I("curry|garam masala|curcuma", "Curry", "2 cucharadas", 0, "u"), cebolla(), I("jengibre", "Jengibre", "un trocito", 0, "u", true), arroz("1 taza y media", 0.4)],
    ["Hervé el arroz (si es basmati o jazmín, mejor).", "Rehogá la cebolla picada con ajo y jengibre rallado. Sumá el curry y tostalo 1 minuto.", "Agregá el pollo en cubos y dorálo.", "Volcá la leche de coco y cociná 15 minutos a fuego bajo hasta que espese. Serví con el arroz y cilantro si tenés."]),
  R("padthai", "Pad thai de pollo", 30, 3, "salado", ["cena"], "pollo", ["gourmet"], [I("fideos de arroz|fideo de arroz|tallarin de arroz", "Fideos de arroz", "250 g", 1, "paquete"), pechuga("400 g", 0.4), huevo(2), I("salsa de soja|soja", "Salsa de soja", "4 cucharadas", 0), I("mani", "Maní", "un puñado", 0, "u", true, "manteca"), verdeo(), limon("1", 1, true)],
    ["Remojá los fideos en agua caliente 10 minutos y escurrilos.", "Salteá el pollo en tiras en un wok o sartén bien caliente. Corrélo a un costado y revolvé los huevos.", "Sumá los fideos, la soja, una cucharada de azúcar y jugo de limón. Saltá 2 minutos.", "Serví con maní picado, verdeo y una rodaja de limón."]),
  R("risottocalabaza", "Risotto de calabaza y salvia", 40, 4, "salado", ["cena"], "verdura", ["veg", "gourmet"], [arroz("1 taza y media", 0.4), calabaza("500 g", 0.5), parmesano(), manteca("2 cucharadas", 0, false), vinoBlanco("medio vaso", 0.1, true), I("salvia", "Salvia", "unas hojas", 0, "u", true)],
    ["Cortá la calabaza en cubitos chicos. Tené caldo caliente a mano (1 litro).", "Rehogá cebolla picada en manteca, sumá el arroz y nacaralo 2 minutos. Mojá con el vino.", "Agregá la calabaza y el caldo de a un cucharón, revolviendo, durante unos 18 minutos.", "Fuera del fuego, sumá manteca fría y parmesano y revolvé enérgicamente. Dorá hojas de salvia en manteca para decorar."]),
  R("risottolimon", "Risotto al limón con langostinos", 40, 4, "salado", ["cena"], "pescado", ["gourmet"], [arroz("1 taza y media", 0.4), langostinos(), limon("1", 1), parmesano(), vinoBlanco("medio vaso", 0.1, true), manteca("2 cucharadas", 0, false)],
    ["Rehogá cebolla picada en manteca, sumá el arroz y nacaralo. Mojá con el vino.", "Agregá caldo caliente de a poco, revolviendo, unos 18 minutos.", "Mientras, saltá los langostinos con ajo 2 minutos, apenas rosados.", "Terminá el risotto con ralladura y un poco de jugo de limón, manteca y parmesano. Serví con los langostinos arriba."]),
  R("salmonhierbas", "Salmón con costra de hierbas", 30, 2, "salado", ["cena"], "pescado", ["gourmet", "horno"], [salmon("400 g", 0.4), rallar(), perejil(false), limon(), manteca("1 cucharada", 0, true), I("esparrago|brocoli|chaucha", "Espárragos o brócoli", "1 atado", 1, "u", true)],
    ["Mezclá pan rallado con perejil y ralladura de limón picados, sal y un chorro de aceite o manteca derretida.", "Poné el salmón en una placa con la piel hacia abajo y apretá la costra arriba.", "Horno fuerte 12 a 15 minutos, según el grosor.", "Acompañá con espárragos o brócoli salteados y una rodaja de limón."]),
  R("truchaalmendras", "Trucha a la manteca de almendras", 25, 2, "salado", ["cena"], "pescado", ["gourmet"], [I("trucha|salmon|pejerrey|merluza", "Filet de trucha", "2", 0.4, "kg"), manteca("3 cucharadas", 0, false), I("almendra|nuez|avellana", "Almendras", "un puñado", 0), limon(), papaSola("4 papas chicas", 0.5)],
    ["Hervé las papas chicas con cáscara.", "Pasá los filetes por harina y cocinálos en sartén con manteca, 3 minutos por lado. Reservá.", "En la misma sartén dorá las almendras fileteadas en manteca hasta que huela a tostado y sumá jugo de limón.", "Bañá el pescado con la manteca de almendras y serví con las papas."]),
  R("langostinosajillo", "Langostinos al ajillo", 15, 2, "salado", ["cena"], "pescado", ["gourmet"], [langostinos(), ajo("5 dientes", false), perejil(), I("aji|guindilla|aji molido", "Ají picante", "una pizca", 0, "u", true), pan("unas rodajas", 0, true)],
    ["Calentá abundante aceite de oliva en una cazuela con el ajo laminado y el ají, a fuego suave, hasta que el ajo apenas tome color.", "Subí el fuego y sumá los langostinos pelados. Cociná 2 minutos hasta que estén rosados.", "Sal y perejil picado. Serví bien caliente con pan para mojar."]),
  R("ceviche", "Ceviche de pescado", 30, 4, "salado", ["almuerzo"], "pescado", ["gourmet"], [pescadoBlanco("500 g bien fresco", 0.5), limon("8", 8), cebolla(1), I("cilantro", "Cilantro", "un puñado", 0, "u", true), I("aji|aji picante|jalapeno", "Ají", "1", 0, "u", true), batata("1", 0.3)],
    ["Cortá el pescado (muy fresco) en cubos de 2 cm y la cebolla morada en pluma fina. Lavá la cebolla en agua fría.", "Exprimí los limones sin apretar demasiado para que no amargue.", "Mezclá el pescado con sal, ají picado y el jugo de limón. Dejalo 5 a 10 minutos: se pone blanco por fuera.", "Sumá cebolla y cilantro. Servilo enseguida con batata hervida."]),
  R("ravcalabaza", "Ravioles de calabaza con manteca y salvia", 30, 3, "salado", ["cena"], "pasta", ["veg", "gourmet"], [I("ravioles|sorrentino|agnolotti", "Ravioles de calabaza o verdura", "1 caja", 1), manteca("60 g", 0, false), I("salvia", "Salvia", "8 hojas", 0, "u", true), parmesano(), nueces()],
    ["Hervé los ravioles en abundante agua con sal.", "Mientras, derretí la manteca a fuego medio con las hojas de salvia hasta que la manteca se ponga color avellana (2 o 3 minutos).", "Escurrí los ravioles y saltalos en la manteca.", "Serví con parmesano en lascas y nueces tostadas picadas."]),
  R("noquisricota", "Ñoquis de ricota con salsa de hongos", 40, 3, "salado", ["cena"], "pasta", ["veg", "gourmet"], [ricota("500 g", 0.5), harina("200 g", 0.2), huevo(1), parmesano(), hongos(), crema()],
    ["Mezclá la ricota escurrida con el huevo, parmesano, sal y nuez moscada. Sumá harina de a poco hasta tener una masa blanda que no se pegue.", "Armá cilindros, cortá trozos y hervilos: salen cuando flotan.", "Salsa: saltá los hongos en manteca con ajo, sumá la crema y reducí 5 minutos.", "Mezclá los ñoquis con la salsa y terminá con pimienta y parmesano."]),
  R("tagliatellehongos", "Tagliatelle con hongos y crema", 25, 3, "salado", ["cena"], "pasta", ["veg", "gourmet"], [fideos("400 g de cintas", 1), hongos("300 g", 0.3), crema(), parmesano(), I("aceite de trufa|hongos secos|hongo seco", "Hongos secos o aceite de trufa", "un poco", 0, "u", true)],
    ["Si tenés hongos secos, hidratálos 15 minutos en agua caliente y picalos.", "Saltá los hongos frescos en manteca con ajo hasta que estén dorados. Sumá los secos y la crema; cociná 5 minutos.", "Hervé la pasta al dente y mezclala con la salsa, agregando un poco del agua de cocción.", "Parmesano, pimienta y, si tenés, unas gotas de aceite de trufa."]),
  R("carbonara", "Spaghetti a la carbonara", 20, 3, "salado", ["cena"], "pasta", ["gourmet"], [fideos("400 g", 1), panceta("150 g", 0.15), huevo(3), parmesano()],
    ["Batí las yemas (y un huevo entero) con mucho parmesano y pimienta negra.", "Dorá la panceta en tiras en una sartén sin aceite hasta que esté crocante.", "Hervé la pasta, guardá una taza del agua de cocción y escurrí.", "Fuera del fuego, mezclá la pasta con la panceta y después con los huevos, sumando agua de cocción hasta lograr una crema. No la vuelvas al fuego, si no se cocina el huevo."]),
  R("quiche", "Quiche lorraine", 60, 6, "salado", ["cena"], "masa", ["gourmet", "horno"], [tapasTarta(), panceta("200 g", 0.2), huevo(3), crema(), queso("150 g", 0.15, false)],
    ["Forrá una tartera con la masa y pinchala con un tenedor. Horneá 10 minutos.", "Dorá la panceta en cubitos.", "Batí los huevos con la crema, sal, pimienta y nuez moscada.", "Distribuí la panceta y el queso sobre la masa, volcá la mezcla y horneá a fuego medio 30 minutos, hasta que esté firme y dorada."]),
  R("tatincebolla", "Tarta de cebollas caramelizadas y queso de cabra", 70, 6, "salado", ["cena"], "masa", ["veg", "gourmet", "horno"], [tapasTarta(), cebolla(5), cabra(), I("aceto|aceto balsamico|balsamico", "Aceto balsámico", "2 cucharadas", 0, "u", true), I("tomillo|romero", "Tomillo", "unas ramitas", 0, "u", true)],
    ["Cortá las cebollas en pluma y cocinálas a fuego bajo con aceite y una pizca de sal 40 minutos, hasta que estén doradas y dulces. Sumá el aceto al final.", "Forrá una tartera con la masa y horneá 10 minutos.", "Rellená con las cebollas y cubrí con rodajas de queso de cabra y tomillo.", "Horneá 20 minutos más. Un hilo de miel arriba queda increíble."]),
  R("ensaladaperas", "Ensalada de rúcula, peras, nueces y queso azul", 10, 2, "salado", ["almuerzo", "cena"], "verdura", ["veg", "gourmet"], [rucula(), pera(2), nueces(false), azul(), miel("1 cucharada", true)],
    ["Lavá y secá bien la rúcula.", "Cortá las peras en láminas finas (con cáscara).", "Armá la ensalada con la rúcula, las peras, las nueces tostadas y el queso azul desmenuzado.", "Aliño: aceite de oliva, una cucharadita de miel, unas gotas de limón o aceto, sal y pimienta."]),
  R("caprese", "Burrata o caprese con tomates", 10, 2, "salado", ["almuerzo", "cena"], "verdura", ["veg", "gourmet"], [mozza("1 burrata o 250 g", 0.25), tomateFresco(4), I("albahaca", "Albahaca", "unas hojas", 0, "u", true), pan("unas rodajas", 0, true)],
    ["Cortá los tomates en rodajas o, si son cherry, por la mitad.", "Acomodalos en un plato con la burrata en el centro o la mozzarella en rodajas.", "Aceite de oliva generoso, sal en escamas, pimienta y albahaca.", "Acompañá con pan tostado."]),
  R("provoleta", "Provoleta con tomates asados", 15, 2, "salado", ["cena"], "verdura", ["veg", "gourmet"], [provolone(), tomateFresco(6, true), I("oregano", "Orégano", "a gusto", 0, "u", true), pan("unas rodajas", 0, true)],
    ["Calentá una sartén de hierro o la parrilla. Pasá los tomates cherry con aceite y sal por la sartén hasta que se ablanden.", "Cociná la provoleta 3 minutos por lado, hasta que tenga costra y esté blanda por dentro.", "Servila con los tomates, orégano, ají molido y aceite de oliva, y pan para acompañar."]),
  R("sopacebolla", "Sopa de cebolla gratinada", 60, 4, "salado", ["cena"], "verdura", ["veg", "gourmet", "horno"], [cebolla(5), manteca("2 cucharadas", 0, false), vinoBlanco("medio vaso", 0.1, true), pan("4 rodajas", 0), queso("150 g", 0.15, false)],
    ["Cortá las cebollas en pluma fina y cocinálas en manteca a fuego bajo 30 minutos, revolviendo, hasta que estén bien doradas.", "Sumá una cucharada de harina, el vino y 1 litro de caldo. Cociná 15 minutos.", "Repartí en cazuelas aptas para horno, poné una rodaja de pan tostado arriba y cubrí con queso.", "Gratiná en el horno hasta que el queso burbujee."]),
  R("gazpacho", "Gazpacho", 15, 4, "salado", ["almuerzo"], "verdura", ["veg", "gourmet"], [tomateFresco(6), I("pepino", "Pepino", "1", 1), morron(false), ajo("1 diente"), pan("1 rodaja", 0, true), I("vinagre", "Vinagre", "un chorro", 0, "u", true)],
    ["Cortá los tomates, el pepino pelado, el morrón y el ajo en trozos.", "Licuá todo con la rodaja de pan, sal, un chorro de vinagre y aceite de oliva hasta que esté bien liso.", "Probá y ajustá la sal. Heladera al menos 1 hora: se sirve bien frío, con cubitos de pepino arriba."]),
  R("shakshuka", "Shakshuka (huevos en salsa especiada)", 30, 2, "salado", ["almuerzo", "cena", "desayuno"], "huevo", ["veg", "gourmet"], [huevo(4), tomate(), morron(false), cebolla(), I("comino|pimenton", "Comino y pimentón", "1 cucharadita", 0, "u", true), pan("para acompañar", 0, true)],
    ["Rehogá cebolla y morrón en tiras en una sartén con aceite.", "Sumá ajo, comino, pimentón y una pizca de ají. Agregá el tomate y cociná 10 minutos.", "Hacé 4 huecos y rompé un huevo en cada uno. Tapá y cociná a fuego bajo 6 minutos, con las yemas blandas.", "Perejil o cilantro arriba y pan para mojar."]),
  R("huevosbenedictinos", "Huevos benedictinos", 25, 2, "salado", ["desayuno"], "huevo", ["gourmet"], [huevo(4), pan("2 panes o 4 rodajas", 0), jamon("4 fetas", 0.08), manteca("80 g", 0, false), limon()],
    ["Salsa holandesa: batí 2 yemas con un chorro de limón a baño María y sumá la manteca derretida de a hilo hasta que espese. Sal.", "Hervé agua con un chorro de vinagre, hacé un remolino y poné un huevo: 3 minutos y sacalo con espumadera (huevo poché). Repetí.", "Tostá el pan y dorá el jamón en una sartén.", "Armá: pan, jamón, huevo poché y salsa holandesa por encima."]),
  R("hummus", "Hummus con pan pita", 10, 4, "salado", ["merienda", "almuerzo"], "legumbre", ["veg", "gourmet"], [garbanzos(), limon(), ajo("1 diente"), I("tahini|tahina|sesamo", "Tahini", "2 cucharadas", 0, "u", true), I("pan arabe|pan pita", "Pan pita", "1 paquete", 1, "u", true)],
    ["Escurrí los garbanzos y guardá un poco del líquido.", "Procesá con jugo de limón, ajo, tahini, sal y aceite de oliva, sumando líquido hasta lograr una crema suave.", "Serví con un hilo de aceite, pimentón y pan pita tostado o bastones de zanahoria."]),
  R("babaganoush", "Crema de berenjenas ahumadas", 40, 4, "salado", ["merienda", "almuerzo"], "verdura", ["veg", "gourmet", "horno"], [berenjena(2), limon(), ajo("1 diente"), yogur("2 cucharadas", 0, true), I("tahini|tahina", "Tahini", "1 cucharada", 0, "u", true)],
    ["Pinchá las berenjenas y asalas enteras sobre la hornalla o en horno fuerte hasta que la piel esté quemada y la pulpa blanda (30 minutos).", "Dejalas enfriar, sacales la pulpa y escurrila.", "Pisala con limón, ajo, yogur o tahini, sal y aceite de oliva.", "Serví con pan tostado."]),
  R("mollejas", "Mollejas al limón", 40, 3, "salado", ["cena"], "carne", ["gourmet"], [I("molleja", "Mollejas", "700 g", 0.7, "kg"), limon("2", 2), perejil(), ajo("2 dientes")],
    ["Blanqueá las mollejas 5 minutos en agua hirviendo con sal. Enfrialas y sacales la telita y la grasa.", "Cortalas en trozos y dorálas en una sartén de hierro bien caliente o a la parrilla hasta que estén crocantes.", "Rociálas con jugo de limón, ajo y perejil picados y sal gruesa. Servilas enseguida."]),
  R("cordero", "Cordero al romero con papas", 120, 6, "salado", ["almuerzo"], "carne", ["gourmet", "horno"], [I("cordero|carre de cordero|pierna de cordero|chivito", "Cordero", "1,5 kg", 1.5, "kg"), I("romero", "Romero", "unas ramitas", 0, "u", true), ajo("1 cabeza", false), vinoBlanco("1 vaso", 0.25, true), papa("1 kg", 1)],
    ["Hacé cortes en la carne e insertá ajo y romero. Untá con aceite, sal y pimienta.", "Poné en una fuente con las papas en trozos y el vino.", "Horno medio (180°) 1 hora y media, dándolo vuelta a mitad de cocción y mojando con el jugo.", "Subí el horno los últimos 15 minutos para que quede dorado."]),
  R("tiramisu", "Tiramisú", 30, 8, "dulce", ["merienda"], "dulce", ["veg", "gourmet"], [vainillas(), mascarpone(), huevo(3), azucar("100 g", 0.1), cafe(), I("cacao", "Cacao amargo", "para espolvorear", 0, "u", true)],
    ["Batí las yemas con el azúcar hasta que estén claras. Sumá el mascarpone o queso crema y mezclá.", "Batí las claras a nieve y mezclalas suavemente con la crema.", "Mojá rápido las vainillas en el café frío y armá capas en una fuente: vainillas, crema, vainillas, crema.", "Heladera 6 horas como mínimo. Espolvoreá cacao al servir."]),
  R("pannacotta", "Panna cotta con frutos rojos", 20, 6, "dulce", ["merienda"], "dulce", ["veg", "gourmet"], [crema(), leche("1 taza", 0.25), azucar("80 g", 0.08), gelatinaSin(), frutosRojos()],
    ["Hidratá la gelatina en 3 cucharadas de agua fría.", "Calentá la crema con la leche, el azúcar y esencia de vainilla sin que hierva. Sumá la gelatina y revolvé hasta disolver.", "Repartí en vasitos y llevá a la heladera 4 horas.", "Salsa: cociná los frutos rojos con 2 cucharadas de azúcar 5 minutos. Servila fría sobre la panna cotta."]),
  R("volcan", "Volcán de chocolate", 25, 4, "dulce", ["merienda"], "dulce", ["veg", "gourmet", "horno"], [chocolate("150 g", 0.15), manteca("100 g", 0, false), huevo(3), azucar("80 g", 0.08), harina("2 cucharadas", 0)],
    ["Derretí el chocolate con la manteca.", "Batí los huevos con el azúcar hasta que espumen. Sumá el chocolate y la harina tamizada.", "Enmantecá 4 moldecitos o tazas, llenalos y llevá a la heladera 20 minutos (o hasta que los vayas a hornear).", "Horno muy fuerte (220°) 8 a 9 minutos: tiene que estar firme por fuera y líquido adentro. Desmoldá y serví con helado."]),
  R("cheesecake", "Cheesecake de frutos rojos", 80, 10, "dulce", ["merienda"], "dulce", ["veg", "gourmet", "horno"], [I("galletita|galletitas dulces|vainillas|galletitas de vainilla", "Galletitas dulces", "200 g", 1, "paquete", false, "chocolate|salada|agua"), manteca("80 g", 0, false), quesoCrema("600 g", 0.6), huevo(3), azucar("150 g", 0.15), frutosRojos()],
    ["Procesá las galletitas con la manteca derretida y forrá la base de un molde desmontable. Heladera 15 minutos.", "Batí el queso crema con el azúcar, sumá los huevos de a uno y esencia de vainilla.", "Volcá sobre la base y horneá a fuego bajo (150°) 50 minutos. Apagá y dejalo enfriar adentro con la puerta entreabierta.", "Heladera toda la noche. Cubrilo con frutos rojos cocidos con un poco de azúcar."]),
  R("lemonpie", "Lemon pie", 70, 8, "dulce", ["merienda"], "dulce", ["veg", "gourmet", "horno"], [tapasTarta(), limon("3", 3), huevo(4), azucar("250 g", 0.25), I("maicena|almidon de maiz|fecula", "Maicena", "3 cucharadas", 0)],
    ["Forrá una tartera con la masa, pinchala y horneá 15 minutos hasta que esté dorada.", "Crema: cociná a fuego bajo el jugo y ralladura de los limones, 1 taza de agua, 150 g de azúcar, la maicena y las 4 yemas, revolviendo hasta que espese. Volcala sobre la masa.", "Merengue: batí las claras a nieve y sumá de a poco 100 g de azúcar hasta que esté firme y brillante.", "Cubrí la tarta con el merengue y dorá en horno fuerte 5 minutos. Heladera antes de servir."]),
  R("perasmalbec", "Peras al malbec", 40, 4, "dulce", ["merienda"], "dulce", ["veg", "gourmet"], [pera(4), vino("2 vasos", 0.5), azucar("100 g", 0.1), I("canela|clavo de olor|anis", "Canela", "1 rama", 0, "u", true), crema(true)],
    ["Pelá las peras dejando el cabito.", "Hervé el vino con el azúcar, la canela y la cáscara de una naranja si tenés.", "Cociná las peras paradas en el vino, tapadas, 25 minutos a fuego bajo, girándolas para que se tiñan parejo.", "Sacalas y reducí el vino hasta que quede un almíbar. Servilas con el almíbar y crema batida."]),
  R("cremebrulee", "Crème brûlée", 60, 6, "dulce", ["merienda"], "dulce", ["veg", "gourmet", "horno"], [crema(), huevo(5), azucar("150 g", 0.15), I("esencia de vainilla|vainilla en chaucha", "Vainilla", "1 cucharadita", 0, "u", true)],
    ["Calentá la crema con la vainilla sin que hierva.", "Batí 5 yemas con 100 g de azúcar y sumá la crema caliente de a poco, sin hacer espuma.", "Repartí en cazuelitas y cociná a baño María en horno bajo (150°) 35 minutos: tiene que temblar en el centro. Heladera 4 horas.", "Antes de servir, cubrí con azúcar y quemala con soplete o con una cuchara calentada al fuego hasta que se forme el caramelo."]),
  R("tatinmanzana", "Tarta tatin de manzanas", 60, 8, "dulce", ["merienda"], "dulce", ["veg", "gourmet", "horno"], [manzana(6), tapasTarta(), azucar("150 g", 0.15), manteca("60 g", 0, false)],
    ["En una sartén que vaya al horno, hacé un caramelo con el azúcar y la manteca.", "Acomodá las manzanas peladas en cuartos bien apretadas sobre el caramelo y cociná 10 minutos a fuego medio.", "Cubrí con la masa, metiendo los bordes hacia adentro. Horno fuerte 25 minutos.", "Dejá reposar 5 minutos y desmoldá dando vuelta sobre una fuente. Servila tibia con helado de crema."]),
  R("mousse_maracuya", "Mousse de maracuyá", 20, 6, "dulce", ["merienda"], "dulce", ["veg", "gourmet"], [I("maracuya|mburucuya|pulpa de maracuya", "Maracuyá", "4 o 1 pulpa", 1), crema(), I("leche condensada", "Leche condensada", "1 lata", 1, "lata"), gelatinaSin()],
    ["Sacá la pulpa de los maracuyás (guardá unas semillas para decorar).", "Licuá la pulpa con la leche condensada.", "Batí la crema a medio punto y mezclala suavemente con lo licuado y la gelatina hidratada y disuelta.", "Repartí en copas y heladera 3 horas. Decorá con semillas."]),
];
