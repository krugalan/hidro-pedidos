-- Import clientes desde Contactos DOC-20260921-WA0129.xlsx
-- 115 clientes
-- Ejecutar en el SQL Editor de Supabase

BEGIN;

WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('• Sabri • Rotisserie Jonas', '+5492254415879') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Jonas' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Sole Goldin', '+5491156649196');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Raña Vane', '+5491128250589') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Merluza 1285' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Adry Happy 😀', '+5492267446612');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Agus Yoga Vecina', '+5491140610066') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Medusas 940' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Alberto', '+5491158510413') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Penelope y Troya' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Alex Sushi', '2254596382') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Eneas y Rivadvia' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Alicia Mazzara', '+5492974019908') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'M. Pescador Y ARTES' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Amalia C. Alegre', '+5491138335391') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Nautilus 2630' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Amelia Granier vecina Yoli', '+5492215554487') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Pejerrey entre Apolo y Totoras' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Amparo', '+5492267534931');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Ana Huergo', '+5492267538611');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Ana Mamá Angi Pilates', '+5492267542098') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Ostende ' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Analia', '+5491154089583') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Afrodita 1381' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Angie Pilates', '+5492267474677') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Paris Ostende' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Arq. Romina Michelon', '+5492267534199') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Alamos' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Avendaño Iassa', '+5492267400226') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Alamos' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Cande Patron 🌸', '+5492254459293') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Corvina entre Artes y Centauro' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Caro Cejas', '+541141717921') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'De los Patos 1350' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Cintia Arq Amiga De Ale', '+5491131558438') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Jilguero' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Clarisa Armando Jalisco', '+5492267537298') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Divisadero' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Claude Verdura', '+5492254534932');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Claudia Bagués Noctilucas', '+5492267660477');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Claudia Caldero', '+5492254590454') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Corvina 1818' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Cristina', '+5492267535919') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Pilates' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Cristina', '+5492267444727') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Sampetesburgo 1572' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Cristina San José', '+5492255601108') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'San Jose' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Cuoco Cris', '+5492267533924') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Bunge y Burriquetas' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Daniel 2 Bar Tapas', '+5492267403871');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Dany ☂️🍄', '+5491126433592') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Garzas Y Shaw' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Donna', '+5492267525185') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Noctiluca y Buen Orden' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Edel', '+5492267675952') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'De las Hesperides 1830' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Edith Lencina Pilates', '+5492254528444');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Eli Canadá 948', '+5492267441114') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Canada 948' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Euge Gardenias', '+5491152281122') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Artes y Libertador' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Gloria', '+5491144264170') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Penelope 449' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Graciela de Bs As Rosselli', '+5491141950455') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Shaw y Cornalitos' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Griselda De Pejerrey', '+5491137034333') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Del Pejerrey' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Hernan Tetamanzi', '2254414788') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Apolo y Rivadavia' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Jorge Lisa 1349', '+5491151106845') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'De la Lisa 1349' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Jorge Medina', '+5492267448094') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Carilo' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Jorge Massida', '2254500520') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Shaw y Martin Pescador' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Juan Verdura', '+5492254445300');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Kari Y Alan Poseidón 436', '+5491139329415') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Poseidon 436' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Lic. Pato Uhrig 🎺', '+5491168512615') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Valle fertil y Dorado' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Lili Mamá Pau Oficina', '+5492254536089') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'De las Artes 1179' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Lore Fernandez', '+5492267542746') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Hospital' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Lula Hermana De Sabri Aserradero', '2267527915') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Bunge 1400' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Marcos Saubidet', '+5491150002348');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Noe', '+5491164884713') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Alamos' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Mariela Carilo', '+5492267530208') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Carilo' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Mariela Titanes 1442', '+5492254411793') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Titanes 1442' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Marina', '+5492254412067') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Calamares 1694' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Marisa Lenti Remax Bosque', '+5491137803189') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Fragata Argentina 950' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Marisol Martin Asmar', '+5492212260155') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Eneas 1087' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Maruscky kiosco', '+5491122815422');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Maxi Pina Santini', '+5492254444003');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Mechi 🌺👸🐩', '+5492254523378');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('MicaM', '+5491138923217') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Trucha 1750' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Mirta Suegra De Cande', '+5492267539208') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Pejerrey 1704' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Moni 2 Pilates', '+5492254620392');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Monica Pami', '+5491153317530');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Monica Vecina De Constanza', '+5492254423664') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Artemisa 416' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Pachi Dunas Shaw 650', '+5492267663249') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Shaw 650' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Fabiana Estilo y Hogar', '+5492254459816') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Shaw 651' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Fabiana Tienda Nordica', '+5492254416094');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Pamela Prof Pilates', '+5492267407681');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Paola Cajal', '+5492254456611') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'De los titanes ' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Paty Sec 2 Triana', '+5492267520542') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Del Odiseo 980' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Pau - Pinamar SA', '+5492254458074');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Ro Alamos', '+5491158675253');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Roberta / Roberto', '+5491144721823') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Burriquetas 2349' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Rochi', '+5492267401404');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Rodrigo Mosto', '+5492214592066') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Eneas y Pejerrey' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Romi Sec Triana', '+5492267443141') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Jason 878' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Romina Geminiani', '+5492267514949');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Rosario Avendaño', '+5492267535288') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Tres Carabelas 1174' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Santiago Gagiro Del Azar', '+5491123122429') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Boulevard Ameghino 349' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Tomas Rossi', '+5492267521352') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Cafe Gren' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Yoli', '+5492267400143') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Pejerrey y Apolo' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Valeria El Refu', '+5493487650521') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Eneas y Corvina' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Renata 🌸', '+5491157500698') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'De Las Martinetas y Nautilus' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Triana eleonora', '2267538024') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Jason 878' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Graciela Frente pileta', '2254538798') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Cazon 1713' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Sandra Coleg Arquitectos', '2254440916') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Constitucion498' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Poli Prentela', '2254594000') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Cangrejo 1450' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Vanesa Vezozi', '2267533698') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'La Herradura' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Diego Langostinos', '1160920847') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'De los Langostinos 1439' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Ismael Zabala', '2267538827') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Del Cazon 1877' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Nicolas Tarakdjian', '1132101297') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Alamos' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Facu', '2254589852');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Sandra', '2254526080');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Juan Mariotti Muni', '2267403235') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Valle fertil y Rivadavia' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Fernando Boustoni', '1165124339');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Yvana Toloza', '1164387178');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Emilia Mar de Olivas', '2214344809');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Marcela', '1151462987');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Gisela Piana', '2267522099') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'De las Artes 450' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Vale nueva', '1127814553');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Yoa', '2254422025');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Dora Berta Jubilada', '1154021792');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Pau Ananda yoga', '1155299577');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Florencia Arq.', '1165731886');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Myriam Paez', '2254509934') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'De las Hesperides 1850' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Gioco Grandillon', '2254440689');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Edith Borghi', '1151830385');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Mariana Vernengo', '1144002545');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Kary Casino', '1166565268');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Leonardo', '2254412675') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Fta. 25 de Mayo 782' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Julia Luques', '1166743022') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Urtubey 2228' FROM _c;
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Marie', '2215072398') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Odiseo y Fragata Victoria' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Mir Gaspari', '2215565692');
WITH _c AS (
  INSERT INTO clientes (nombre, whatsapp) VALUES ('Monica Dibbo', '2215946241') RETURNING id
)
INSERT INTO direcciones (cliente_id, calle) SELECT id, 'Cipreses y Eolo' FROM _c;
INSERT INTO clientes (nombre, whatsapp) VALUES ('Euge', '2254617162');
INSERT INTO clientes (nombre, whatsapp) VALUES ('Ali Hamburgueseria en Pinamar', '1136934862');

COMMIT;

