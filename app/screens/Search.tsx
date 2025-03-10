import React, { useEffect, useState } from "react";  
import {
  Text,
  View,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { db, auth } from "@/config/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Colors from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";

const ratingList = [4.5, 4.7, 3.5, 4.3, 3.7];
const getRandomRating = () =>
  ratingList[Math.floor(Math.random() * ratingList.length)];

const Index: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Coding", "Development", "Database", "New Tech"];

  // Mapping from normalized image key to local asset.
  const courseImages: { [key: string]: any } = {
    'javaprogramming': require('@/assets/images/courses/bannerj.png'),
    'python': require('@/assets/images/courses/bannerpython.png'),
    'c': require('@/assets/images/courses/bannerc.png'),
    'cpp': require('@/assets/images/courses/bannercpp.png'),
    'devops': require('@/assets/images/courses/bannerdevops.png'),
    'cyber': require('@/assets/images/courses/bannercyber.png'),
    'flutter': require('@/assets/images/courses/bannerflutter.png'),
    'javascriptprogramming': require('@/assets/images/courses/bannerjavascript.png'),
    'nosqldatabase': require('@/assets/images/courses/bannerns.png'),
    'sqldatabase': require('@/assets/images/courses/banners.png'),
    'react_n': require('@/assets/images/courses/bannerreactn.png'),
    'rust': require('@/assets/images/courses/bannerrust.png'),
    'webdev': require('@/assets/images/courses/bannerwebdev.png'),
    default: require('@/assets/images/bannerj.png'),
  };
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const coursesList: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          coursesList.push({
            id: doc.id,
            ...data,
            rating: data.rating || getRandomRating(),
          });
        });
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = searchQuery
      ? course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) // Search across all courses
      : true;

    const matchesCategory =
      searchQuery || selectedCategory === "All" || // Ignore category if searching
      course.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleCoursePress = async (item: any) => {
    const user = auth.currentUser;
    if (!user) return;

    const courseRef = doc(db, `users/${user.uid}/enrolledCourses`, item.courseTitle);
    const docSnap = await getDoc(courseRef);

    if (docSnap.exists()) {
      router.replace({
        pathname: "/courseView/courseDetail",
        params: { courseParams: JSON.stringify(item) },
      });
    } else {
      router.replace({
        pathname: "../courseView",
        params: { courseParams: JSON.stringify(item) },
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`star-${i}`} name="star" size={16} color="#FFD700" />);
    }
    if (halfStar) {
      stars.push(<Ionicons key="star-half" name="star-half" size={16} color="#FFD700" />);
    }
    return stars;
  };

  // Helper function to play pop sound
  const playPopSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sound/pop.mp3') // Adjust the path if necessary
      );
      await sound.setVolumeAsync(0.3);
      await sound.playAsync();
      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch (error) {
      console.error("Error playing pop sound:", error);
    }
  };

  // Render each course item with dynamic image selection and pop sound on press
  const renderCourseItem = ({ item }: { item: any }) => {
    // Normalize the image name from Firebase
    let imageKey = "default";
    if (item.image) {
      imageKey = item.image.trim().toLowerCase();
      if (imageKey.includes(".")) {
        imageKey = imageKey.split(".")[0];
      }
    }
    const imageSource = courseImages[imageKey] || courseImages.default;

    return (
      <TouchableOpacity
        style={styles.courseCard}
        onPress={async () => {
          await playPopSound();
          await handleCoursePress(item);
        }}
      >
        <Image source={imageSource} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.courseTitle || "No Title Available"}
          </Text>
          <View style={styles.metaContainer}>
            <View style={styles.ratingContainer}>
              {renderStars(item.rating)}
              <Text style={styles.ratingText}>
                {item.rating?.toFixed(1) || "4.5"}
              </Text>
            </View>
            <View style={styles.chapterContainer}>
              <Ionicons name="book-outline" size={16} color="#666" />
              <Text style={styles.chapterText}>
                {item.noOfChapter ? `${item.noOfChapter} Chapters` : "No Chapters"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCourseSection = (cat: string) => {
    const catCourses = courses.filter((course) => {
      const matchesSearch = searchQuery
        ? course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesCategory =
        selectedCategory === "All" ||
        course.category?.toLowerCase() === selectedCategory.toLowerCase();
      return (
        matchesSearch &&
        matchesCategory &&
        (cat === "popular"
          ? course.type === "popular"
          : course.category?.toLowerCase() === cat.toLowerCase())
      );
    });
    if (catCourses.length === 0) return null;
    const isPopular = cat === "popular";
    const title = isPopular
      ? "Must Try Courses"
      : `${cat.charAt(0).toUpperCase() + cat.slice(1)} Courses`;
    return (
      <View key={cat} style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>{title}</Text>
        <FlatList
          data={catCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={["rgb(142, 187, 255)", "rgb(252, 252, 252)"]} style={styles.loadingContainer}>
      <StatusBar
              hidden={false}
              barStyle="light-content"
              backgroundColor="rgb(142, 187, 255)"
            />
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["rgb(142, 187, 255)", "rgb(252, 252, 252)"]} style={styles.container}>
      <StatusBar
              hidden={false}
              barStyle="light-content"
              backgroundColor="#0D47A1"
            />
      <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={async () => {
            await playPopSound();
            router.back();
          }}
        >
          <View style={styles.iconBadge}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for courses..."
            placeholderTextColor="black"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={24} color={Colors.primary} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={async () => {
                await playPopSound();
                setSelectedCategory(category);
              }}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Entypo style={styles.noResultsIcon} name="open-book" size={90} color={Colors.black} />
            <Text style={styles.noResults}>No courses found</Text>
          </View>
        )}
        renderItem={({ item }) => renderCourseItem({ item })}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"rgba(255, 255, 255, 0)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  iconContainer: { flexDirection: "row", position: "absolute", top: 15, left: 0 },
  iconBadge: { position: "relative", marginLeft: 10, backgroundColor: "#1976D2", padding: 8, borderRadius: 10 },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontFamily: "outfit-bold",
    marginVertical: 10,
    marginLeft: 50,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.87)',
    borderRadius: 10,
    paddingHorizontal: 12,
    margin: 10,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "outfit",
    color: Colors.black,
  },
  categoryScroll: {
    flexDirection: "row",
    marginTop: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.87)',
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: "outfit-bold",
  },
  selectedCategoryText: {
    color: "white",
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  noResultsIcon: { textAlign: "center", marginBottom: 10 },
  noResults: {
    fontFamily: "outfit-bold",
    textAlign: "center",
    fontSize: 26,
    color: Colors.black,
  },
  courseCard: {
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    borderRadius: 12,
    margin: 10,
    marginLeft: 20,
    width: 300,
  },
  cardImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: "outfit-bold",
    marginBottom: 5,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 5,
    color: "#666",
    fontFamily: "outfit",
  },
  chapterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chapterText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
    fontFamily: "outfit",
  },
  sectionContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  sectionHeader: {
    fontSize: 24,
    fontFamily: "outfit-bold",
    marginBottom: 10,
  },
});

export default Index;