'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { DateInput, TimeInput, DateValue, Button } from '@heroui/react';
import { I18nProvider } from '@react-aria/i18n';

export default function Step1BasicInformationConciliation() {
	const { setValue } = useFormContext();
	const [fechaNacimiento, setFechaNacimiento] = useState<DateValue | null>(null);
	const [horaSeleccionada, setHoraSeleccionada] = useState(null);

	return (
		<div className='space-y-8'>
			<div className='mt-8'>
				<h3 className='text-lg font-medium mb-3'>Agendar audiencia de conciliación</h3>
				<p className='mb-6'>Fecha y hora de audiencia de conciliación</p>

				<div className='flex flex-row flex-wrap gap-4 w-full items-end'>
					<div className='flex-1 min-w-[200px]'>
						<I18nProvider locale='es'>
							<DateInput
								variant='bordered'
								label='Fecha'
								labelPlacement='outside'
								value={fechaNacimiento}
								onChange={(date) => {
									setFechaNacimiento(date);
									if (date) {
										const formattedDate = date.toString().split('T')[0];
										setValue('ciudadano_solicitante.fecha_nacimiento', formattedDate);
									}
								}}
								isRequired
								className='w-full'
							/>
						</I18nProvider>
					</div>

					<div className='flex-1 min-w-[200px]'>
						<I18nProvider locale='es'>
							<TimeInput
								variant='bordered'
								label='Hora'
								labelPlacement='outside'
								value={horaSeleccionada}
								onChange={(time) => {
									setHoraSeleccionada(time);
									if (time) {
										const horaFormateada = time.toString();
										setValue('ciudadano_solicitante.hora', horaFormateada);
									}
								}}
								isRequired
								className='w-full'
							/>
						</I18nProvider>
					</div>

					{/* Contenedor para Botón */}
					<div className='flex-1 min-w-[200px]'>
						<Button
							color='primary'
							variant='solid'
							className='w-full h-[40px]' // Misma altura aproximada que los inputs
						>
							Agregar opción de fecha
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
