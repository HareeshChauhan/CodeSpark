import React, { useState, useEffect } from "react";
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
} from "react-native";
import { db, auth } from "@/config/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Colors from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const ratingList = [4.5, 4.7, 3.5, 4.3, 3.7];
const getRandomRating = () => ratingList[Math.floor(Math.random() * ratingList.length)];

const Index: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Coding", "Development", "Database", "New Tech"];

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
      ? course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = searchQuery
      ? true
      : selectedCategory === "All" ||
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient colors={["rgb(142, 187, 255)", "rgb(252, 252, 252)"]} style={styles.container}>
      <LinearGradient
        colors={["#0D47A1", "#1976D2"]}
        style={styles.headerContainer}
      >
        <TouchableOpacity style={styles.iconContainer} onPress={()=>router.back()}>
      {/* Notification Icon */}
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category)}
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
            <Entypo
              style={styles.noResultsIcon}
              name="open-book"
              size={90}
              color={Colors.black}
            />
            <Text style={styles.noResults}>No courses found</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.courseCard}
            onPress={() => handleCoursePress(item)}
          >
            <Image
              source={require("@/assets/images/java.png")}
              style={styles.cardImage}
            />
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
                    {item.noOfChapter
                      ? `${item.noOfChapter} Chapters`
                      : "No Chapters"}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
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
  iconContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 15,
    left: 0,
  },
  iconBadge: {
    position: "relative",
    marginLeft: 10,
    backgroundColor: "#1976D2",
    padding: 8,
    borderRadius: 10,
  },
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
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 12,
    margin: 10,
    
  },
  cardImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: "outfit-bold",
    marginBottom: 10,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  noResultsIcon: {
    textAlign: "center",
    marginBottom: 10,
  },
  noResults: {
    fontFamily: "outfit-bold",
    textAlign: "center",
    fontSize: 26,
    color: Colors.black,
  },
});

export default Index;