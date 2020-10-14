import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Platform } from 'react-native';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/Auth';
import api from '../../services/api';

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,

  ProvidersListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
} from './styles';

interface RouteParams {
    providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}
interface Availabilityitem {
  hour: number;
  available: boolean;
}
const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute();
  const { goBack, navigate } = useNavigation();

  const routeParams = route.params as RouteParams;

  const [availability, setAvailability] = useState<Availabilityitem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>( routeParams.providerId,);

  const minimumDate = useMemo(() => {
    const today = new Date();

    if (today.getHours() >= 17) {
      return new Date(today.setDate(today.getDate() + 1));
    }

    return today;
  }, []);

  const [selectedDate, setSelectedDate] = useState(minimumDate);
  const [selectedHour, setSelectedHour] = useState(0);

  useEffect(() => {
    api.get('providers').then((response) => {
      setProviders(response.data);
    });

  }, []);

  useEffect(() => {
  api.get(`providers/${selectedProvider}/day-availability`, {
    params: {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
      day: selectedDate.getDate(),
    }}).then((response) => {
      setAvailability(response.data)
    });
  }, [selectedDate,selectedProvider]);


  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker((state) => !state);
  },[]);

  const handleDateChanged = useCallback((event: any,date:Date | undefined)=>{
    if (Platform.OS ==='android') {
      setShowDatePicker(false);
    }
    if(date){
      setSelectedDate(date);
    }
  },[])

  const navigateBack = useCallback(()=>{
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);


  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);

      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', {
        provider_id: selectedProvider,
        date,
      });

      navigate('AppointmentCreated', { date: date.getTime() });
    } catch (err) {
      Alert.alert(
        'Erro ao criar agendamento',
        'Ocorreu um erro ao tentar criar o agendamento, tente novamente!',
      );
    }
  }, [selectedProvider, selectedDate, selectedHour,navigate]);

  const morningAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => ({
        hour,
        hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        available,
      }));
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => ({
        hour,
        hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        available,
      }));
  }, [availability]);

  return <Container >
      <Header>
      <BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591"/>
        </BackButton>
        <HeaderTitle>Cabeleireiros</HeaderTitle>

      <UserAvatar source={{ uri: user.avatar_url}}></UserAvatar>
      </Header>

      <ProvidersListContainer>
        <ProvidersList
          data={providers}
          keyExtractor={(provider) => provider.id}
          renderItem={({ item: provider }) => (
            <ProviderContainer
              selected={provider.id === selectedProvider}
              onPress={() => handleSelectProvider(provider.id)}
            >
              <ProviderAvatar source={{ uri: provider.avatar_url }} />
              <ProviderName selected={provider.id === selectedProvider}>
                {provider.name}
              </ProviderName>
            </ProviderContainer>
          )}
        />
      </ProvidersListContainer>

    <Calendar>
      <Title>Escolha a data</Title>

      <OpenDatePickerButton onPress={handleToggleDatePicker }>

          <OpenDatePickerButtonText>
            Selecionar data
          </OpenDatePickerButtonText>

        </OpenDatePickerButton>

        { showDatePicker && (
          <DateTimePicker
          mode="date"
          is24Hour
          display="calendar"
          value={selectedDate}
          onChange={handleDateChanged}
          // textColor="#f4ede8"
          // minimumDate={minimumDate}
        />
        )}
     </Calendar>
     <Schedule>
        <Title>Escolha o horário</Title>

        <Section>
          <SectionTitle>Manhã</SectionTitle>

          <SectionContent>
            {morningAvailability.map(({ hourFormatted, hour, available }) => (
              <Hour
                available={available}
                selected={hour === selectedHour}
                onPress={() => setSelectedHour(hour)}
                key={hourFormatted}
              >
                <HourText selected={hour === selectedHour}>
                  {hourFormatted}
                </HourText>
              </Hour>
            ))}
          </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Tarde</SectionTitle>

            <SectionContent>
              {afternoonAvailability.map(
                ({ hourFormatted, hour, available }) => (
                  <Hour
                    available={available}
                    selected={hour === selectedHour}
                    onPress={() => setSelectedHour(hour)}
                    key={hourFormatted}
                  >
                    <HourText selected={hour === selectedHour}>
                      {hourFormatted}
                    </HourText>
                  </Hour>
                ),
              )}
           </SectionContent>
          </Section>
    </Schedule>

    <CreateAppointmentButton onPress={handleCreateAppointment}>
      <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
    </CreateAppointmentButton>

  </Container>;
}

export default CreateAppointment;
