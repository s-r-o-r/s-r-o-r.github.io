# Dietas etapa 2

Se finalizo la etapa 1 de las dietas.

## Datos de la etapa 2

## Reglas

Nacional e internacional

las sguientes horas sera parametrizable seran 4 parametrizaciones, las 8 las 12 y las 20 las 12 de la asistencia

### Nacionales

1N si trabaja a partir de las 20 horas
2N si sale a partir de las 8 am
3N si sale antes de las 8 am

Si el chofer inicia fuera de su plaza siempre es 3N sin importar el horario 2026-07-23 minuto 16:48

osea 1N solo cena 2N almuerzo y cena 3 N desayuno almuerzo y cena

### Internacionales

4N si trabaja internacional a partir de las 20 horas
5N si trabaja internacional a partir de las 8 am horas
6N si trabaja internacional antes de las 8 am horas

### Festivos o domingos Nacionales

1F si trabaja en festivo o domingo a partir de las 20 horas
2F si trabaja en festivo o domingo a partir de las 12 am
3F si trabaja en festivo o domingo antes de las 12 am


Si el chofer inicia fuera de su plaza aunque arranque a las 5 de la tarde siempre es 3F sin importar el horario 2026-07-23 minuto 22:27

### Festivos o domingos Internacionales

4F si trabaja internacional en festivo o domingo a partir de las 20 horas
5F si trabaja internacional en festivo o domingo a partir de las 12 am
6F si trabaja internacional en festivo o domingo antes de las 12 am

### Pausas, bajas y vacaciones

tblendalia_absenteeism_requests
ST-P
ST-B
ST-V


### Mega Camion 

En la tabla de expeidiciones hay un campo que dice si la tarifa es mega trunk

### Las plazas son las sucursales (Zaragoza, barcelona y leon)

Nos fijamos en la bd si el conductor esta haciendo plaza, si esta fiera de su plaza se le asigna la dieta aplica los criterios N, si todo el dia esta en su plaza hasta 10 horas sera 0 horas pero si el chofer pasa de las 10 horas en su plaza se anotan sus horas extras siempre redondeando hacia abajo 0.5 - 1 - 1.5 ... etc.

### RHH (esto va aparte no es el mismo calculo de la dieta solo para los que trabajan en plaza)
Re4cursos humanos controla las personas que trabajan el los dias, y el dia solo cuenta para las personas que comienzan a trabajar antes de las 12 del medio dia si comienzan despues ya no cuenta como dia trabajado, solo se tiquea en otra tabla si trabajo o no para sacar a fin de mes cuantos dias trabajaron. (esto ira en una tabla aparte)

### Pendiente
Que pasa si salgo internacional a las 5 am pero a las 10 am entro a espana es 4N o 2N? no puedo poner dos dietas pero tengo que pagar el desayuno internacional y el resto nacional. 


### Tarjeta en descanzo

FSN Si el conductor esta fuera de su plaza pero su tarjeta esta puesta en descanzo y no ha tenido conduccion en el dia en territorio Nacional
FSI Si el conductor esta fuera de su plaza pero su tarjeta esta puesta en descanzo y no ha tenido conduccion en el dia en territorio Internacional

Si estan en su plaza y su tarjeta esta en descanzo no le ponemos nada.