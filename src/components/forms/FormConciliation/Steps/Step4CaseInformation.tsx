import { Input } from '@heroui/react';
import { useFormContext } from 'react-hook-form';
import { DateInput, TimeInput, DateValue, Button } from '@heroui/react';
import { I18nProvider } from '@react-aria/i18n';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Step4CaseInformation() {
	const { register } = useFormContext();

	return (
		<div>
			<h3 className='text-lg font-medium '>Crear solicitud de conciliación</h3>
			<div>
				<Input
					variant='bordered'
					label='Cuánto hace que se inició el conflicto:'
					labelPlacement='outside'
					placeholder='Ingresar la información solicitada '
					{...register('ciudadano_solicitante.num_documento')}
					isRequired
				/>
			</div>
			<div>
				<Input
					variant='bordered'
					label='Escala del conflicto:'
					labelPlacement='outside'
					placeholder='Ingresar la información solicitada '
					{...register('ciudadano_solicitante.num_documento')}
					isRequired
				/>
			</div>
			<div>
				{/*cambiar este input por un Dropdown*/}
				<Input
					variant='bordered'
					label='Escala del conflicto:'
					labelPlacement='outside'
					placeholder='Ingresar la información solicitada '
					{...register('ciudadano_solicitante.num_documento')}
					isRequired
				/>
			</div>
			<div className='flex-1 min-w-[220px] relative'>
				{/*agregar value y onChange para manejar el input de fecha*/}
				<I18nProvider locale='es'>
					<DateInput variant='bordered' label='Fecha' labelPlacement='outside' isRequired className='w-full pr-10' />
				</I18nProvider>
			</div>

			<div>
				{/*cambiar este input por un Dropdown*/}
				<Input
					variant='bordered'
					label='Escala del conflicto:'
					labelPlacement='outside'
					placeholder='Ingresar la información solicitada'
					{...register('ciudadano_solicitante.num_documento')}
					isRequired
				/>
			</div>

			<div>
				{/*cambiar este input por un Dropdown*/}
				<Input
					variant='bordered'
					label='Documento firmado:'
					labelPlacement='outside'
					placeholder='Ingresar la información solicitada'
					{...register('ciudadano_solicitante.num_documento')}
				/>
			</div>

			<div>
				{/*cambiar este input por un Dropdown*/}
				<h3>Hechos</h3>
				<Input
					variant='bordered'
					label='La controversia que desea solucionar tiene como hechos los siguientes, narrados por la persona solicitante:'
					labelPlacement='outside'
					placeholder='Ingresar la información solicitada'
					{...register('ciudadano_solicitante.num_documento')}
					isRequired
				/>
			</div>

			<div>
				{/*cambiar este input por un Dropdown*/}
				<h3>Pretenciones</h3>
				<Input
					variant='bordered'
					label='El (La) usuario(a) solicita se consigne las siguientes pretensiones:'
					labelPlacement='outside'
					placeholder='Ingresar la información solicitada'
					{...register('ciudadano_solicitante.num_documento')}
					isRequired
				/>
			</div>

			<div>
				{/*cambiar este input por un Dropdown*/}
				<h3>Cuantía</h3>
				<Input
					variant='bordered'
					label='De igual manera, la cuantía del conflicto asciende a la suma de:'
					labelPlacement='outside'
					placeholder='Ingresar la información solicitada'
					{...register('ciudadano_solicitante.num_documento')}
					isRequired
				/>
			</div>

			<div>
				{/*cambiar este input por un Dropdown*/}
				<h3>Fundamentos de derecho</h3>
				<Input
					variant='bordered'
					labelPlacement='outside'
					placeholder='Ingresar la información solicitada'
					{...register('ciudadano_solicitante.num_documento')}
					isRequired
				/>
			</div>

			<div>
				<h3>Anexos obligatorios</h3>
			</div>

			<div>
				<h3>Anexos adicionales</h3>
			</div>

			<div>
				{/*cambiar este input por un Dropdown*/}
				<h3>Pruebas solicitante</h3>
				<Input
					variant='bordered'
					label='De igual manera se discriminan las pruebas que soporten los hechos relacionados: '
					labelPlacement='outside'
					placeholder='Ingresar la información solicitada'
					{...register('ciudadano_solicitante.num_documento')}
				/>
			</div>

			<div>
				{/*cambiar este input por un Dropdown*/}
				<h3>Pruebas citado</h3>
				<Input
					variant='bordered'
					label='De igual manera se discriminan las pruebas que soporten los hechos relacionados: '
					labelPlacement='outside'
					placeholder='Ingresar la información solicitada'
					{...register('ciudadano_solicitante.num_documento')}
				/>
			</div>
		</div>
	);
}
