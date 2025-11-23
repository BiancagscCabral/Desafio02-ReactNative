import 'react-native-gesture-handler';
import * as React from 'react';
import { View, StyleSheet, FlatList, ScrollView, Image } from 'react-native';
import { NavigationContainer, DrawerActions, DefaultTheme as NavLight } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  Appbar,
  Text,
  Button,
  Card,
  Icon,
  Searchbar,
  Chip,
  ActivityIndicator,
  Paragraph,
  Title,
  Avatar
} from 'react-native-paper';

// --- 1. Tipagens (Types) ---

interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
}

interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
}

type RootDrawerParamList = {
  'Início': undefined;
  Sobre: undefined;
};

type RootStackParamList = {
  Tabs: undefined;
  Detalhes: { meal: Meal }; 
};

type DetalhesProps = NativeStackScreenProps<RootStackParamList, 'Detalhes'>;

// --- 2. Configuração da Navegação ---

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

// --- 3. Tema Personalizado (Laranja "Chef") ---

const chefTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#F97316', // Laranja vibrante
    secondary: '#FDBA74',
    background: '#FFF7ED', // Fundo creme suave
    surface: '#FFFFFF',
    onSurface: '#1F2937',
  },
};

const navTheme = {
  ...NavLight,
  colors: {
    ...NavLight.colors,
    primary: '#F97316',
    background: '#FFF7ED',
    card: '#FFFFFF',
    text: '#1F2937',
    border: '#FED7AA',
  },
};

// --- 4. Componentes de Tela ---

function Header({ title, navigation }: any) {
  return (
    <Appbar.Header mode="center-aligned" elevated style={{ backgroundColor: '#FFF' }}>
      <Appbar.Action icon="menu" onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} />
      <Appbar.Content title={title} titleStyle={{ fontWeight: 'bold', color: '#F97316' }} />
    </Appbar.Header>
  );
}

// --- TELA HOME ---
function HomeScreen({ navigation }: any) {
  const [randomMeal, setRandomMeal] = React.useState<Meal | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const resMeal = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const jsonMeal = await resMeal.json();
      
      const resCat = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
      const jsonCat = await resCat.json();

      if (jsonMeal.meals) setRandomMeal(jsonMeal.meals[0]);
      if (jsonCat.categories) setCategories(jsonCat.categories);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={{ marginTop: 10 }}>Preparando a cozinha...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Header na tela */}
      <Header title="Destaques" navigation={navigation} />
      <ScrollView style={styles.screen}>
        <Title style={styles.sectionTitle}>Sugestão do Chef 👨‍🍳</Title>
        {randomMeal && (
          <Card mode="elevated" onPress={() => navigation.navigate('Detalhes', { meal: randomMeal })} style={styles.cardSpacing}>
            <Card.Cover source={{ uri: randomMeal.strMealThumb }} />
            <Card.Title 
              title={randomMeal.strMeal} 
              subtitle={`${randomMeal.strCategory} | ${randomMeal.strArea}`}
              left={(props) => <Avatar.Icon {...props} icon="food" style={{ backgroundColor: '#F97316' }} />}
            />
          </Card>
        )}

        <Title style={styles.sectionTitle}>Categorias</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
          {categories.map((cat) => (
            <Card key={cat.idCategory} mode="outlined" style={styles.catCard} onPress={() => alert(`Categoria: ${cat.strCategory}`)}>
              <Card.Cover source={{ uri: cat.strCategoryThumb }} style={styles.catImage} />
              <Card.Content>
                <Text variant="labelLarge" style={{ textAlign: 'center', marginTop: 5 }}>{cat.strCategory}</Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
        
        <Button mode="contained" onPress={loadData} style={{ marginVertical: 20 }} icon="refresh">
          Nova Sugestão
        </Button>
      </ScrollView>
    </>
  );
}

// --- TELA BUSCAR ---
function SearchScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [loading, setLoading] = React.useState(false);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const performSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`);
      const json = await response.json();
      setMeals(json.meals || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Buscar Receitas" navigation={navigation} />
      <View style={styles.screenContainer}>
        <View style={{ padding: 16 }}>
          <Searchbar
            placeholder="Buscar (ex: Cake, Pie)"
            onChangeText={onChangeSearch}
            value={searchQuery}
            onSubmitEditing={performSearch}
            onIconPress={performSearch}
            elevation={2}
          />
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} color="#F97316" />
        ) : (
          <FlatList
            data={meals}
            keyExtractor={(item) => item.idMeal}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, opacity: 0.5 }}>Nenhuma receita encontrada.</Text>}
            renderItem={({ item }) => (
              <Card 
                mode="elevated" 
                style={{ marginBottom: 12 }}
                onPress={() => navigation.navigate('Detalhes', { meal: item })}
              >
                <Card.Title 
                  title={item.strMeal} 
                  subtitle={item.strCategory}
                  left={(props) => <Avatar.Image {...props} size={40} source={{ uri: item.strMealThumb }} />}
                  right={(props) => <Icon source="chevron-right" {...props} />}
                />
              </Card>
            )}
          />
        )}
      </View>
    </>
  );
}

// --- TELA DETALHES ---
function DetalhesScreen({ route, navigation }: DetalhesProps) {
  const { meal } = route.params;

  return (
    <>
      <Appbar.Header mode="small" elevated style={{ backgroundColor: '#FFF' }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={meal.strMeal} />
        <Appbar.Action icon="heart-outline" onPress={() => {}} />
      </Appbar.Header>
      
      <ScrollView style={styles.screenContainer}>
        <Image source={{ uri: meal.strMealThumb }} style={styles.detailImage} />
        
        <View style={styles.contentPadding}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <Chip icon="tag" mode="outlined">{meal.strCategory}</Chip>
            <Chip icon="map-marker" mode="outlined">{meal.strArea}</Chip>
          </View>

          <Title>Modo de Preparo</Title>
          <Paragraph style={{ lineHeight: 22, marginTop: 8 }}>
            {meal.strInstructions}
          </Paragraph>
        </View>
      </ScrollView>
    </>
  );
}

function TabsScreen() {
  return (
    <Tabs.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#F97316',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 0, elevation: 5 },
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === 'Destaques' ? 'silverware-fork-knife' : 'magnify';
          return <Icon source={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Destaques" component={HomeScreen} />
      <Tabs.Screen name="Buscar" component={SearchScreen} />
    </Tabs.Navigator>
  );
}

function StackPrincipal({ navigation }: any) {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsScreen} />
      <Stack.Screen name="Detalhes" component={DetalhesScreen} />
    </Stack.Navigator>
  );
}

function SobreScreen({ navigation }: any) {
  return (
    <>
      <Header title="Sobre" navigation={navigation} />
      <View style={[styles.screenContainer, { padding: 16 }]}>
        <Card>
          <Card.Title title="Chef de Bolso v1.0" left={(p) => <Icon source="information" {...p} />} />
          <Card.Content>
            <Paragraph>App de receitas desenvolvido com React Native Paper e TheMealDB API.</Paragraph>
          </Card.Content>
        </Card>
      </View>
    </>
  );
}

export default function App() {
  return (
    <PaperProvider theme={chefTheme}>
      <NavigationContainer theme={navTheme}>
        <Drawer.Navigator
          id={undefined}
          screenOptions={{
            headerShown: false,
            drawerActiveTintColor: '#F97316',
            drawerStyle: { backgroundColor: '#FFF7ED' },
          }}
        >
          <Drawer.Screen
            name="Início"
            component={StackPrincipal}
            options={{
              drawerIcon: ({ color, size }) => <Icon source="home" size={size} color={color} />,
            }}
          />
          <Drawer.Screen
            name="Sobre"
            component={SobreScreen}
            options={{
              drawerIcon: ({ color, size }) => <Icon source="information-outline" size={size} color={color} />,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// --- 5. Estilos ---

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFF7ED', 
  },
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF7ED', 
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
    color: '#C2410C'
  },
  cardSpacing: {
    marginBottom: 20,
  },
  catCard: {
    width: 120,
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  catImage: {
    height: 80,
  },
  detailImage: {
    width: '100%',
    height: 250,
  },
  contentPadding: {
    padding: 16,
  }
});