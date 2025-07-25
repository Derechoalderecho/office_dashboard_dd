'use client';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { DateInput, TimeInput, DateValue, Button } from '@heroui/react';
import { Time, parseTime } from '@internationalized/date'; // Importaciones correctas
import { I18nProvider } from '@react-aria/i18n';
import { Card } from '@heroui/react';

const CardContent = ({ children }: { children: React.ReactNode }) => <div className='p-4'>{children}</div>;

export default function Step1BasicInformationConciliation() {
	const { setValue } = useFormContext();
	const [fechaNacimiento, setFechaNacimiento] = useState<DateValue | null>(null);
	const [horaSeleccionada, setHoraSeleccionada] = useState<Time | null>(null);
	const [opciones, setOpciones] = useState<{ fecha: string; hora: string }[]>([]);

	const handleTimeChange = (time: Time) => {
		setHoraSeleccionada(time);
		if (time) {
			const horaStr = `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
			setValue('ciudadano_solicitante.hora', horaStr);
		}
	};

	const agregarOpcion = () => {
		if (fechaNacimiento && horaSeleccionada) {
			const fechaStr = fechaNacimiento.toString().split('T')[0];
			const horaStr = `${horaSeleccionada.hour.toString().padStart(2, '0')}:${horaSeleccionada.minute
				.toString()
				.padStart(2, '0')}`;

			setOpciones([
				...opciones,
				{
					fecha: fechaStr,
					hora: horaStr,
				},
			]);
			setFechaNacimiento(null);
			setHoraSeleccionada(null);
			setValue('ciudadano_solicitante.fecha', '');
			setValue('ciudadano_solicitante.hora', '');
		}
	};

	return (
		<div className='space-y-8 w-full'>
			<div className='mt-8'>
				<h3 className='text-lg font-medium mb-3'>Agendar audiencia de conciliación</h3>
				<p>Fecha y hora de audiencia de conciliación</p>

				<div className='flex flex-wrap gap-4 w-full items-end mt-4'>
					{/* Input Fecha */}
					<div className='flex-1 min-w-[220px]'>
						<I18nProvider locale='es'>
							<DateInput
								variant='bordered'
								label='Fecha'
								labelPlacement='outside'
								value={fechaNacimiento}
								onChange={setFechaNacimiento}
								isRequired
								className='w-full'
							/>
						</I18nProvider>
					</div>

					{/* Input Hora */}
					<div className='flex-1 min-w-[220px]'>
						<I18nProvider locale='es'>
							<TimeInput
								variant='bordered'
								label='Hora'
								labelPlacement='outside'
								value={horaSeleccionada}
								onChange={handleTimeChange}
								isRequired
								className='w-full'
							/>
						</I18nProvider>
					</div>

					{/* Botón */}
					<div className='flex-1 min-w-[220px]'>
						<Button color='primary' variant='solid' className='w-full h-[40px]' onClick={agregarOpcion}>
							Agregar opción de fecha
						</Button>
					</div>
				</div>

				{/* Listado de opciones */}
				<div className='grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6'>
					{opciones.map((opcion, index) => (
						<div key={index} className='border-l-4 border-primary bg-black-5 rounded-md px-4 py-2'>
							<p className='text-sm font-semibold text-primary mb-1'>Opción fecha {index + 1}</p>
							<p className='text-sm text-black-80'>{opcion.fecha}</p>
							<p className='text-sm text-black-80'>{opcion.hora}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
