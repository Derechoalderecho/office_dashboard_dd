import { useFormContext } from 'react-hook-form';
import { I18nProvider } from '@react-aria/i18n';
import {
  Input,
  Select,
  SelectItem,
  DateInput,
} from '@heroui/react';

export default function Step4CaseInformation() {
  const { register, setValue, watch } = useFormContext();
  const departments = ['Departamento 1', 'Departamento 2']; // Define tus departamentos aquí

  return (
    <div>
      <h3 className='text-lg font-medium'>Crear solicitud de conciliación</h3>

      <div className='mt-12'>
        <Input
          variant='bordered'
          label='Cuánto hace que se inició el conflicto:'
          labelPlacement='outside'
          placeholder='Ingresar la información solicitada'
          {...register('conflicto.tiempo_inicio')}
          isRequired
        />
      </div>

      <div className='mt-12'>
        <Input
          variant='bordered'
          label='Escala del conflicto:'
          labelPlacement='outside'
          placeholder='Ingresar la información solicitada'
          {...register('conflicto.escala')}
          isRequired
        />
      </div>

      <div className='flex flex-wrap gap-4 w-full items-end mt-4'>
        <div className='flex-1 min-w-0'>
          <Select
            variant='bordered'
            label='La última vez que alguien intervino en el conflicto fue:'
            labelPlacement='outside'
            placeholder='Seleccione su departamento'
            selectedKeys={watch('conflicto.ultima_intervencion') ? [watch('conflicto.ultima_intervencion')] : []}
            onChange={(e) => setValue('conflicto.ultima_intervencion', e.target.value)}
            isRequired
          >
            {departments.map((dept) => (
              <SelectItem key={dept}>{dept}</SelectItem>
            ))}
          </Select>
        </div>

        <div className='flex-1 min-w-0'>
          <I18nProvider locale='es'>
            <DateInput
              variant='bordered'
              label='Fecha de intervención'
              labelPlacement='outside'
              isRequired
              className='w-full pr-10'
              value={watch('conflicto.fecha_intervencion') || null}
              onChange={(dateValue) => {
                setValue('conflicto.fecha_intervencion', dateValue);
              }}
            />
          </I18nProvider>
        </div>

        <div className='flex-1 min-w-0'>
          <Select
            variant='bordered'
            label='Modalidad de la audiencia:'
            labelPlacement='outside'
            placeholder='Seleccione la modalidad'
            selectedKeys={watch('audiencia.modalidad') ? [watch('audiencia.modalidad')] : []}
            onChange={(e) => setValue('audiencia.modalidad', e.target.value)}
            isRequired
          >
            {departments.map((dept) => (
              <SelectItem key={dept}>{dept}</SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className='mt-12'>
        <Input
          variant='bordered'
          label='Documento firmado:'
          labelPlacement='outside'
          placeholder='Ingresar la información solicitada'
          {...register('documentos.firmado')}
        />
      </div>

      <div className='mt-6'>
        <h3>Hechos</h3>
        <Input
          variant='bordered'
          label='La controversia que desea solucionar tiene como hechos los siguientes, narrados por la persona solicitante:'
          labelPlacement='outside'
          placeholder='Ingresar la información solicitada'
          {...register('hechos.descripcion')}
          isRequired
        />
      </div>

      <div className='mt-6'>
        <h3>Pretensiones</h3>
        <Input
          variant='bordered'
          label='El (La) usuario(a) solicita se consigne las siguientes pretensiones:'
          labelPlacement='outside'
          placeholder='Ingresar la información solicitada'
          {...register('pretensiones.descripcion')}
          isRequired
        />
      </div>

      <div className='mt-6'>
        <h3>Cuantía</h3>
        <Input
          variant='bordered'
          label='De igual manera, la cuantía del conflicto asciende a la suma de:'
          labelPlacement='outside'
          placeholder='Ingresar la información solicitada'
          {...register('cuantia.monto')}
          isRequired
        />
      </div>

      <div className='mt-6'>
        <h3>Fundamentos de derecho</h3>
        <Input
          variant='bordered'
          label='Fundamentos de derecho:'
          labelPlacement='outside'
          placeholder='Ingresar la información solicitada'
          {...register('fundamentos.descripcion')}
          isRequired
        />
      </div>

      <div className='mt-6'>
        <h3>Anexos obligatorios</h3>
        {/* Aquí puedes agregar campos para anexos obligatorios */}
      </div>

      <div className='mt-6'>
        <h3>Anexos adicionales</h3>
        {/* Aquí puedes agregar campos para anexos adicionales */}
      </div>

      <div className='mt-6'>
        <h3>Pruebas solicitante</h3>
        <Input
          variant='bordered'
          label='De igual manera se discriminan las pruebas que soporten los hechos relacionados: '
          labelPlacement='outside'
          placeholder='Ingresar la información solicitada'
          {...register('pruebas.solicitante')}
        />
      </div>

      <div className='mt-6'>
        <h3>Pruebas citado</h3>
        <Input
          variant='bordered'
          label='De igual manera se discriminan las pruebas que soporten los hechos relacionados: '
          labelPlacement='outside'
          placeholder='Ingresar la información solicitada'
          {...register('pruebas.citado')}
        />
      </div>
    </div>
  );
}
