import VueRouter from 'vue-router';
import Search from '../vue/search.vue';
import Detailed from '../vue/detailed.vue';
import Loading from '../vue/loading.vue';

const routes = [
	{path: '/', component: Loading},
	{path: '/item/:id', component: Detailed},
	{path: '/search/:query', component: Search},
]; 

export default new VueRouter({
	routes,
	mode: 'abstract',
});