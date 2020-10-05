import React, {useState, useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  StatusBar,
  TextInput,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import {useAsyncStorage} from '@react-native-community/async-storage';
import uniqBy from 'lodash/uniqBy';

import defaultImage from './src/assets/cover.png';
import Article from './src/components/Article';
import {getNews} from './src/components/news';

const initialPageMeta = {
  fetching: true,
  refreshing: true,
  next: {page: 1},
  fetchError: null,
};
const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  const [isReady, setIsReady] = useState(false);
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('eth');
  const [pageMeta, setPageMeta] = useState(initialPageMeta);
  const {getItem, setItem} = useAsyncStorage('query');
  const handleLoadMore = () => {
    if (!pageMeta.next) {
      return;
    }
    setPageMeta({...pageMeta, fetching: true});
    getNews({
      q: query,
      ...pageMeta.next,
    })
      .then((res) => {
        const newArticles = uniqBy(
          articles.concat(res.articles),
          (item) => item.url,
        );
        const hasMore = res.totalResults > newArticles.length;
        setPageMeta({
          ...pageMeta,
          fetching: false,
          next: hasMore
            ? {
                page: pageMeta.next.page + 1,
              }
            : null,
        });
        setArticles(newArticles);
      })
      .catch((err) => {
        setPageMeta({
          ...pageMeta,
          fetching: false,
          fetchError: err,
        });
      });
  };
  const handleRefresh = () => {
    setPageMeta(initialPageMeta);
    getNews({
      q: query,
      page: 1,
    })
      .then((res) => {
        setPageMeta({
          refreshing: false,
          fetching: false,
          next:
            res.totalResults > res.articles.length
              ? {
                  page: 2,
                }
              : null,
        });
        setArticles(res.articles);
      })
      .catch((err) => {
        setPageMeta({
          ...initialPageMeta,
          fetching: false,
          refreshing: false,
          fetchError: err,
        });
      });
  };
  const updateQuery = async () => {
    setQuery(search);
    setSearch('');
    await setItem(search);
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, isReady]);
  useEffect(() => {
    // restore query from storage
    getItem()
      .then((val) => {
        if (val) {
          setQuery(val);
        }
      })
      .finally(() => {
        setIsReady(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder={`Keyword, [${query}]`}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={updateQuery}
          />
          <TouchableOpacity
            style={styles.searchBtn}
            disabled={pageMeta.refreshing}
            onPress={updateQuery}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1}}>
          <FlatList
            keyExtractor={(item, index) => item.url}
            data={articles}
            refreshing={pageMeta.refreshing}
            onRefresh={handleRefresh}
            onEndReachedThreshold={0.2}
            onEndReached={handleLoadMore}
            renderItem={({item, index}) => {
              return (
                <Article
                  featuredTitle={item.title}
                  featuredText={item.description}
                  image={
                    item.urlToImage ? {uri: item.urlToImage} : defaultImage
                  }
                  url={item.url}
                />
              );
            }}
            ListEmptyComponent={() => {
              if (pageMeta.fetching || pageMeta.fetchError) {
                return null;
              }
              return (
                <View style={styles.listFooter}>
                  <Text>No Related Content</Text>
                </View>
              );
            }}
            ListFooterComponent={() => {
              if (!pageMeta.refreshing && pageMeta.fetching) {
                return (
                  <View style={styles.listFooter}>
                    <Text>Loading...</Text>
                  </View>
                );
              }
              if (pageMeta.fetchError) {
                return (
                  <View style={styles.listFooter}>
                    <Text>{pageMeta.fetchError.message}</Text>
                    <TouchableOpacity onPress={handleLoadMore}>
                      <Text>Retry</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              if (articles.length && !pageMeta.next) {
                return (
                  <View style={styles.listFooter}>
                    <Text>-- No more content --</Text>
                  </View>
                );
              }
              return null;
            }}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  searchBar: {
    height: 50,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, .2)',
    borderBottomWidth: 0.5,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    height: 46,
    fontSize: 18,
    paddingHorizontal: 8,
  },
  searchBtn: {
    height: 50,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  searchBtnText: {
    fontSize: 16,
  },
  listFooter: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
